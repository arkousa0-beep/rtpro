# 🔥 خطة إصلاح التوجيه، الأداء، الكاشنج، وحفظ الجلسة

> **تاريخ:** 2026-04-11  
> **المشكلة الرئيسية:** عند الانتقال لأي صفحة، يتم إرجاع المستخدم للصفحة الرئيسية  
> **النطاق:** Routing, Session, Caching, Performance, Service Worker, Auth

---

## 📋 جدول المحتويات

1. [ملخص التحليل](#1-ملخص-التحليل)
2. [المشاكل المكتشفة (مرتبة حسب الخطورة)](#2-المشاكل-المكتشفة)
3. [خطة الإصلاح التفصيلية](#3-خطة-الإصلاح-التفصيلية)
4. [تحسينات الأداء](#4-تحسينات-الأداء)
5. [تحسينات الكاشنج](#5-تحسينات-الكاشنج)
6. [تحسينات حفظ الجلسة](#6-تحسينات-حفظ-الجلسة)
7. [ترتيب التنفيذ](#7-ترتيب-التنفيذ)

---

## 1. ملخص التحليل

### الملفات التي تم فحصها
| الملف | الغرض | الحالة |
|-------|--------|--------|
| `src/proxy.ts` | Next.js 16 middleware (بديل middleware.ts) | ⚠️ مشاكل حرجة |
| `src/lib/supabase/middleware.ts` | Supabase session logic | ⚠️ API قديم |
| `src/lib/supabase/client.ts` | Browser Supabase client | ✅ جيد (singleton) |
| `src/lib/supabase/server.ts` | Server Supabase client | ⚠️ API قديم |
| `src/hooks/useRouteGuard.ts` | Client-side route protection | 🔴 السبب الرئيسي للمشكلة |
| `src/components/layout/AppShell.tsx` | App shell wrapper | ⚠️ بدون auth caching |
| `src/components/layout/BottomNav.tsx` | Bottom navigation | ⚠️ duplicate auth calls |
| `src/lib/store/dataStore.ts` | Zustand in-memory store | ✅ جيد |
| `src/lib/store/uiStore.ts` | UI state persistence | ✅ جيد |
| `src/lib/services/offlineService.ts` | Offline cache service | ⚠️ غير مستخدم بشكل كامل |
| `public/sw.js` | Service Worker | 🔴 يسبب caching مشاكل |
| `.next/server/middleware-manifest.json` | Build manifest | 🔴 الـ middleware فارغ |

### التشخيص السريع
```
المستخدم يفتح صفحة /transactions 
  → proxy.ts (Next.js middleware): ربما لا يعمل أصلاً (manifest فارغ)
  → useRouteGuard(transactions) يعمل
    → supabase.auth.getUser() → ينجح (user موجود)
    → supabase.from('profiles').select() → يفشل أحياناً (race condition / network)
      → catch block → router.replace("/") 🔴 هنا المشكلة!
```

---

## 2. المشاكل المكتشفة

### 🔴 حرج (P0) — السبب المباشر للمشكلة

#### المشكلة 1: `useRouteGuard` يعمل redirect على "/" عند أي خطأ
**الملف:** `src/hooks/useRouteGuard.ts` (سطر 93-102)

```typescript
// المشكلة: أي خطأ في الـ network أو race condition يوجه للرئيسية
} catch (error) {
  console.error("Authorization check failed", error);
  if (isMounted) {
    setIsAuthorized(false);
    setIsLoading(false);
  }
  if (!hasRedirected.current) {
    hasRedirected.current = true;
    router.replace("/");  // 🔴 هنا! أي خطأ = redirect
  }
}
```

**لماذا يحدث هذا؟**
- عند فتح صفحة جديدة، `getUser()` أو query الـ profile يمكن يفشل بسبب:
  - الكوكيز لم تتحدث بعد (race condition) 
  - الشبكة بطيئة
  - Token expired بلحظة وبيتحدث
- الـ catch يمسك أي error ويعمل redirect فوراً بدون retry

#### المشكلة 2: Proxy/Middleware قد لا يعمل أصلاً
**الملف:** `src/proxy.ts` + `.next/server/middleware-manifest.json`

```json
// middleware-manifest.json
{
  "version": 3,
  "middleware": {},        // 🔴 فارغ! الـ proxy مش شغال
  "sortedMiddleware": [],
  "functions": {}
}
```

**المعنى:** Next.js مش شايف الـ proxy file. يعني:
- مفيش session refresh على كل request
- مفيش حماية routes على مستوى الـ server
- الكوكيز مش بتتحدث — يعني الـ token ممكن ينتهي

#### المشكلة 3: Supabase cookie API قديم
**الملف:** `src/lib/supabase/middleware.ts` + `src/lib/supabase/server.ts`

```typescript
// الكود الحالي (قديم - deprecated)
cookies: {
  get(name: string) { ... },
  set(name: string, value: string, options: CookieOptions) { ... },
  remove(name: string, options: CookieOptions) { ... },
}

// المطلوب (الـ API الجديد)
cookies: {
  getAll: () => { ... },
  setAll: (cookiesToSet) => { ... },
}
```

---

### ⚠️ مهم (P1) — مشاكل أداء وتجربة مستخدم

#### المشكلة 4: duplicate auth calls (5+ calls per navigation)
كل ما المستخدم يفتح صفحة، الـ `supabase.auth.getUser()` بيتنادى من:
1. `proxy.ts` → server-side (لو شغال)
2. `useRouteGuard()` → client-side
3. `BottomNav` → `loadPermissions()` 
4. `page.tsx` → `fetchStats()` (في الصفحة الرئيسية)
5. أي hook يحتاج auth

**كل call = HTTP request لـ Supabase** = بطء + latency

#### المشكلة 5: Service Worker يكاش صفحات HTML
**الملف:** `public/sw.js` (سطر 69-86)

```javascript
// Stale-While-Revalidate يكاش كل حاجة بما فيها HTML pages
// ممكن يرجع صفحة cached قديمة (مثلاً الصفحة الرئيسية) بدل الصفحة المطلوبة
event.respondWith(
  caches.match(request).then((cachedResponse) => {
    const fetchPromise = fetch(request).then(...)
    return cachedResponse || fetchPromise;  // 🔴 يرجع cached أولاً!
  })
);
```

**المشكلة:** ممكن يرجع الـ cached homepage بدل الصفحة الفعلية عند أول load.

#### المشكلة 6: مفيش Cache-Control headers للصفحات المحمية
المفروض authenticated responses تكون `Cache-Control: private, no-store` عشان CDN والـ cache مش يحفظوا بيانات مستخدم.

---

### 💡 تحسينات (P2) — أداء وكاشنج

#### المشكلة 7: مفيش auth session cache على مستوى التطبيق
كل component بيعمل `getUser()` لوحده بدون deduplication.

#### المشكلة 8: الـ dataStore مفيش persistence
الـ `dataStore.ts` بيستخدم `create()` من zustand بدون `persist` — يعني كل ما يتعمل refresh بتروح كل الداتا.

#### المشكلة 9: `useRealtimeSubscription` بيعمل channel جديد كل mount
```typescript
const channelName = `realtime-${table}-${event}-${Date.now()}`; // unique كل مرة
```
مفيش reuse للـ channels.

#### المشكلة 10: مفيش `loading.tsx` files للصفحات
Next.js App Router بيستخدم `loading.tsx` لعرض loading state أثناء تحميل الصفحة. مفيش ولا واحدة.

---

## 3. خطة الإصلاح التفصيلية

### Phase 1: إصلاح المشكلة الحرجة (Proxy + Auth)

#### 1.1 إصلاح ملف الـ Proxy

**الحالة الحالية:** `src/proxy.ts` — exported named function مع config
**المطلوب:** التأكد إنه يتعرف عليه من Next.js 16

```typescript
// src/proxy.ts — الكود المصلح
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// في Next.js 16، الـ proxy file لازم يكون:
// 1. اسمه proxy.ts (✅ موجود)
// 2. يكون في src/ أو root (✅ موجود في src/)
// 3. يصدر named export proxy (✅ موجود)
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**خطوات الإصلاح:**
1. مسح `.next` folder بالكامل وإعادة build
2. التأكد من الـ manifest بعد البناء
3. لو لسة فاضي — نجرب نقل الملف لـ root (`d:\rtpro\proxy.ts`)

#### 1.2 تحديث Supabase middleware لـ API الجديد

```typescript
// src/lib/supabase/middleware.ts — الكود المصلح
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')

  if (!user && !isLoginPage && !isAuthCallback) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // ⭐ Critical: Set cache-control for authenticated responses
  response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate')

  return response
}
```

#### 1.3 تحديث Server Client

```typescript
// src/lib/supabase/server.ts — الكود المصلح
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Can fail in Server Components (read-only context)
          }
        },
      },
    }
  )
}
```

### Phase 2: إصلاح useRouteGuard

#### 2.1 إعادة كتابة useRouteGuard مع retry وgraceful handling

```typescript
// src/hooks/useRouteGuard.ts — الكود المصلح
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProfilePermissions } from "@/lib/database.types";

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // ms

export function useRouteGuard(
  requiredPermission?: keyof ProfilePermissions | (keyof ProfilePermissions)[]
) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasRedirected = useRef(false);
  const retryCount = useRef(0);

  const checkAuthorization = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      // Auth error (not just "no user") — could be network issue, retry
      if (authError && authError.status !== 401) {
        throw authError;
      }

      if (!user) {
        setIsAuthorized(false);
        setIsLoading(false);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace("/login");
        }
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, permissions")
        .eq("id", user.id)
        .single();

      // Profile fetch failed — retry instead of redirecting
      if (profileError || !profile) {
        throw new Error(profileError?.message || "Profile not found");
      }

      const role = profile.role;
      const perms = profile.permissions as ProfilePermissions;

      // Manager = full access
      if (role === "Manager") {
        setIsAuthorized(true);
        setIsLoading(false);
        retryCount.current = 0;
        return;
      }

      // No specific permission required = any authenticated user
      if (!requiredPermission) {
        setIsAuthorized(true);
        setIsLoading(false);
        retryCount.current = 0;
        return;
      }

      // Check permission
      let hasAccess = false;
      if (Array.isArray(requiredPermission)) {
        hasAccess = requiredPermission.some((p) => perms?.[p] === true);
      } else {
        hasAccess = perms?.[requiredPermission] === true;
      }

      setIsAuthorized(hasAccess);
      setIsLoading(false);
      retryCount.current = 0;

      if (!hasAccess && !hasRedirected.current) {
        hasRedirected.current = true;
        router.replace("/");
      }
    } catch (error) {
      console.error("Authorization check failed:", error);

      // ⭐ Retry logic بدل ما نعمل redirect فوراً
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        console.log(`Retrying auth check (${retryCount.current}/${MAX_RETRIES})...`);
        setTimeout(() => checkAuthorization(), RETRY_DELAY);
        return;
      }

      // All retries exhausted — still don't redirect blindly
      // Show error state instead, let user retry manually
      setIsAuthorized(false);
      setIsLoading(false);
      
      // ⭐ فقط redirect لو مفيش user أصلاً (مش مشكلة شبكة مؤقتة)
      // لو مشكلة مؤقتة، خلي الـ UI يعرض "حدث خطأ" بدل redirect
    }
  }, [requiredPermission, router]);

  useEffect(() => {
    let isMounted = true;
    retryCount.current = 0;
    hasRedirected.current = false;

    checkAuthorization();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        hasRedirected.current = false;
        retryCount.current = 0;
        setIsLoading(true);
        setIsAuthorized(null);
        checkAuthorization();
      }
      if (event === "SIGNED_OUT") {
        hasRedirected.current = false;
        setIsAuthorized(false);
        setIsLoading(false);
        router.replace("/login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAuthorization]);

  return { isAuthorized, isLoading };
}
```

### Phase 3: Auth Session Provider (تقليل duplicate calls)

#### 3.1 إنشاء Auth Context Provider

```typescript
// src/lib/auth/AuthProvider.tsx — ملف جديد
"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ProfilePermissions } from "@/lib/database.types";

interface AuthProfile {
  role: string;
  permissions: ProfilePermissions;
}

interface AuthContextType {
  user: User | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  isManager: boolean;
  hasPermission: (perm: keyof ProfilePermissions | (keyof ProfilePermissions)[]) => boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  const fetchAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role, permissions")
          .eq("id", user.id)
          .single();

        setProfile(profileData ? {
          role: profileData.role,
          permissions: profileData.permissions as ProfilePermissions,
        } : null);
      }
    } catch (error) {
      console.error("Auth fetch error:", error);
    } finally {
      setIsLoading(false);
      fetchedRef.current = true;
    }
  };

  useEffect(() => {
    fetchAuth();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchAuth();
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isManager = profile?.role === "Manager";

  const hasPermission = (perm: keyof ProfilePermissions | (keyof ProfilePermissions)[]) => {
    if (isManager) return true;
    if (!profile?.permissions) return false;
    if (Array.isArray(perm)) {
      return perm.some((p) => profile.permissions[p] === true);
    }
    return profile.permissions[perm] === true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      isManager,
      hasPermission,
      refreshAuth: fetchAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

#### 3.2 تعديل `layout.tsx` لاستخدام AuthProvider

```typescript
// src/app/layout.tsx — إضافة AuthProvider
import { AuthProvider } from "@/lib/auth/AuthProvider";

// ... في return:
<body>
  <ErrorBoundary>
    <AuthProvider>       {/* ← جديد */}
      <ServiceWorkerRegister />
      <OfflineIndicator />
      <AppShell>{children}</AppShell>
      <Toaster theme="dark" position="bottom-center" richColors />
    </AuthProvider>      {/* ← جديد */}
  </ErrorBoundary>
</body>
```

#### 3.3 تبسيط BottomNav وAppShell

```typescript
// BottomNav — بدل auth call مستقل
import { useAuth } from "@/lib/auth/AuthProvider";

export function BottomNav() {
  const { hasPermission, isLoading } = useAuth();
  // ... استخدام hasPermission بدل loadPermissions
}
```

### Phase 4: إصلاح Service Worker

#### 4.1 منع كاشنج صفحات HTML

```javascript
// public/sw.js — الكود المصلح
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (request.url.includes('realtime') || request.url.includes('socket')) return;

  // ⭐ لا تكاش navigation requests (صفحات HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  // ⭐ لا تكاش Supabase auth requests
  if (request.url.includes('/auth/')) return;

  // API calls: Network-first, cache fallback
  if (request.url.includes('/rest/v1/') || request.url.includes('/rpc/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => 
          caches.match(request).then((cached) =>
            cached || new Response(
              JSON.stringify({ error: 'offline' }),
              { headers: { 'Content-Type': 'application/json' }, status: 503 }
            )
          )
        )
    );
    return;
  }

  // Static assets only: Cache-first
  if (request.url.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Everything else: Network-first
  event.respondWith(fetch(request));
});
```

---

## 4. تحسينات الأداء

### 4.1 إضافة `loading.tsx` لكل route group

```typescript
// src/app/loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );
}
```

الصفحات المطلوب adds `loading.tsx`:
- `src/app/loading.tsx` (global)
- `src/app/transactions/loading.tsx`
- `src/app/pos/loading.tsx`  
- `src/app/inventory/loading.tsx`
- `src/app/finance/loading.tsx`
- `src/app/customers/loading.tsx`
- `src/app/suppliers/loading.tsx`

### 4.2 تقليل Framer Motion layout animations

```typescript
// AppShell.tsx — الحالي
<motion.div 
  layout                          // 🔴 يسبب re-layout على كل navigation
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>

// المصلح — بدون layout animation على الـ wrapper
<motion.div 
  key={pathname}                  // ✅ animate فقط عند تغيير الصفحة
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
```

### 4.3 تحسين Realtime Subscriptions

```typescript
// بدل ما كل component يعمل subscription لوحده
// ممكن نعمل global subscription manager

// src/lib/realtime/realtimeManager.ts — ملف جديد
const activeChannels = new Map<string, ReturnType<typeof supabase.channel>>();

export function getOrCreateChannel(table: string, event: string) {
  const key = `${table}-${event}`;
  if (activeChannels.has(key)) return activeChannels.get(key)!;
  
  const channel = supabase.channel(`global-${key}`).on(
    'postgres_changes',
    { event, schema: 'public', table },
    (payload) => {
      // Notify all subscribers
      subscribers.get(key)?.forEach(cb => cb(payload));
    }
  ).subscribe();
  
  activeChannels.set(key, channel);
  return channel;
}
```

### 4.4 Lazy Loading للصفحات الثقيلة

```typescript
// src/app/finance/page.tsx — مثال
import dynamic from 'next/dynamic';

const FinanceCharts = dynamic(() => import('@/components/finance/Charts'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

---

## 5. تحسينات الكاشنج

### 5.1 استراتيجية الكاشنج المقترحة

| البيانات | استراتيجية | TTL | التنفيذ |
|----------|------------|-----|---------|
| Auth session | Memory (React Context) | حتى logout | AuthProvider |
| Profile/Permissions | Memory + localStorage | 5 min | AuthProvider + offlineService |
| Products list | Zustand (memory) | حتى refresh | dataStore |
| Transactions | Zustand (memory) | حتى refresh | dataStore |
| Categories | Zustand + persist | 30 min | dataStore + persist |
| Static assets | SW Cache | Forever | sw.js |
| API responses | SW Cache (network-first) | Offline only | sw.js |
| HTML pages | No cache | - | sw.js fix |

### 5.2 إضافة persist للـ dataStore (optional)

```typescript
// src/lib/store/dataStore.ts — اختياري
// ممكن نضيف persist لبعض الداتا اللي مش بتتغير كتير (categories, suppliers)
// لكن نخلي products و transactions بدون persist عشان up-to-date
```

### 5.3 إضافة Supabase response caching

```typescript
// في الـ hooks: check cache أولاً، ثم fetch
import { getFromCache, saveToCache } from '@/lib/services/offlineService';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useCategories() {
  const fetchCategories = async (silent = false) => {
    // Check cache first
    const cached = getFromCache<Category[]>('categories', CACHE_TTL);
    if (cached && !silent) {
      setCategories(cached);
      setLoading(false);
      // Still fetch in background to update
    }
    
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      saveToCache('categories', data);
    } catch (err) {
      // If offline and no cache, use stale cache without TTL
      const stale = getFromCache<Category[]>('categories');
      if (stale) setCategories(stale);
    }
  };
}
```

---

## 6. تحسينات حفظ الجلسة

### 6.1 Session Recovery

```typescript
// src/lib/auth/sessionRecovery.ts — ملف جديد
import { createClient } from '@/lib/supabase/client';

/**
 * محاولة استعادة الجلسة عند فشل getUser()
 * بيحاول يعمل token refresh قبل ما يعتبر الجلسة انتهت
 */
export async function attemptSessionRecovery(): Promise<boolean> {
  const supabase = createClient();
  
  // Try refreshing the session
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error || !data.session) {
    return false;
  }
  
  return true;
}
```

### 6.2 تحسين Supabase Client config

```typescript
// src/lib/supabase/client.ts — إضافات
client = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'rtpro-auth-token',
      flowType: 'pkce',  // ← أكثر أماناً
    },
    global: {
      headers: {
        'x-app-version': '1.0.0',  // ← tracking
      },
    },
  }
)
```

### 6.3 Tab Visibility Handling

```typescript
// في AuthProvider: عند العودة للـ tab، تحقق من الجلسة
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Re-check auth after tab becomes visible again
      fetchAuth();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

---

## 7. ترتيب التنفيذ

### المرحلة 1 — إصلاح حرج (يحل مشكلة الـ redirect فوراً)
| # | المهمة | الملف | الأولوية |
|---|--------|-------|----------|
| 1 | مسح `.next` وإعادة build للتأكد من proxy | `.next/` | P0 |
| 2 | تحديث Supabase middleware API (`getAll/setAll`) | `src/lib/supabase/middleware.ts` | P0 |
| 3 | تحديث Supabase server client API | `src/lib/supabase/server.ts` | P0 |
| 4 | إصلاح `useRouteGuard` (retry + no blind redirect) | `src/hooks/useRouteGuard.ts` | P0 |
| 5 | إضافة `Cache-Control` headers | `src/lib/supabase/middleware.ts` | P0 |

### المرحلة 2 — أداء وتجربة مستخدم
| # | المهمة | الملف | الأولوية |
|---|--------|-------|----------|
| 6 | إنشاء `AuthProvider` | `src/lib/auth/AuthProvider.tsx` | P1 |
| 7 | تعديل `layout.tsx` لإضافة AuthProvider | `src/app/layout.tsx` | P1 |
| 8 | تبسيط `BottomNav` باستخدام `useAuth` | `src/components/layout/BottomNav.tsx` | P1 |
| 9 | تبسيط `page.tsx` (الرئيسية) | `src/app/page.tsx` | P1 |
| 10 | إصلاح Service Worker | `public/sw.js` | P1 |

### المرحلة 3 — تحسينات متقدمة
| # | المهمة | الملف | الأولوية |
|---|--------|-------|----------|
| 11 | إضافة `loading.tsx` لكل route | `src/app/*/loading.tsx` | P2 |
| 12 | تحسين Framer Motion animations | `src/components/layout/AppShell.tsx` | P2 |
| 13 | تحسين Realtime subscriptions | `src/hooks/useRealtimeSubscription.ts` | P2 |
| 14 | إضافة Tab visibility handling | `src/lib/auth/AuthProvider.tsx` | P2 |
| 15 | تفعيل offlineService caching للـ hooks | `src/hooks/*.ts` | P2 |

---

## ملخص تأثير الإصلاح المتوقع

| المقياس | قبل | بعد |
|---------|------|-----|
| Redirect to home bug | 🔴 يحصل دائماً | ✅ محلول |
| Auth API calls per navigation | 5+ | 1 (cached) |
| First page load | ~3-5s | ~1-2s |
| Session persistence | ⚠️ أحياناً تضيع | ✅ مستمرة |
| Offline support | ⚠️ ممكن يعرض HTML قديم | ✅ fallback صحيح |
| Cache-Control headers | ❌ مفقود | ✅ private, no-store |
| SW page caching bugs | 🔴 يكاش HTML | ✅ network-only للصفحات |
