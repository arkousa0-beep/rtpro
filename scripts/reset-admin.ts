import { createAdminClient } from "../src/lib/supabase/admin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function resetUsers() {
  const supabase = createAdminClient();
  
  console.log("Starting user reset process...");

  // 1. Get all users from Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  console.log(`Found ${users.length} users. Deleting...`);

  // 2. Delete all users from Auth (this usually cascades to profiles if set up correctly, but we'll be safe)
  for (const user of users) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error(`Failed to delete user ${user.id}:`, deleteError.message);
    } else {
      console.log(`Deleted user: ${user.email}`);
    }
  }

  // 3. Create the new Admin user
  const adminEmail = "arko@smartstore.com"; // Using a placeholder email as password-only auth isn't standard in Supabase management via admin.createUser without email
  const adminPassword = "2276";
  const fullName = "arko";

  console.log(`Creating new admin user: ${fullName} (${adminEmail})`);

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (authError) {
    console.error("Error creating auth user:", authError.message);
    return;
  }

  const userId = authData.user.id;

  // 4. Create the profile for the new admin
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      full_name: fullName,
      role: "Manager",
      permissions: {
        pos: true,
        inventory: true,
        finance: true,
        staff: true,
        customers: true,
        suppliers: true,
        transactions: true,
      },
    } as any);

  if (profileError) {
    console.error("Error creating profile:", profileError.message);
  } else {
    console.log("Admin user 'arko' created successfully with all permissions.");
    console.log(`Login Email: ${adminEmail}`);
    console.log(`Login Password: ${adminPassword}`);
  }
}

resetUsers();
