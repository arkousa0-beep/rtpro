
import { createEmployeeAction } from "./src/app/actions/userActions";

async function setupAdmin() {
  console.log("Starting admin setup...");
  try {
    const result = await createEmployeeAction({
      fullName: "arko",
      email: "arko@smartstore.com",
      password: "2276",
      role: "Manager"
    });
    console.log("Result:", result);
  } catch (err) {
    console.error("Exec error:", err);
  }
}

setupAdmin();
