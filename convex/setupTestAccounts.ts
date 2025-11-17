import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { Scrypt } from "lucia";

type Role = "admin" | "manager" | "barista" | "customer";

type TestAccount = {
  email: string;
  password: string;
  role: Role;
  firstName: string;
  lastName: string;
};

const PASSWORD_PROVIDER_ID = "password";

const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: "admin@coffeeshop.com",
    password: "admin123",
    role: "admin",
    firstName: "Admin",
    lastName: "User",
  },
  {
    email: "manager@coffeeshop.com",
    password: "manager123",
    role: "manager",
    firstName: "Manager",
    lastName: "User",
  },
  {
    email: "barista@coffeeshop.com",
    password: "barista123",
    role: "barista",
    firstName: "Barista",
    lastName: "User",
  },
  {
    email: "customer@coffeeshop.com",
    password: "customer123",
    role: "customer",
    firstName: "Customer",
    lastName: "User",
  },
];

// Setup test account roles (call this after creating the accounts)
export const setupTestAccountRoles = mutation({
  args: {},
  handler: async (ctx) => {
    let ensuredCount = 0;
    let missingUsers = 0;

    for (const account of TEST_ACCOUNTS) {
      const user = await findUserByEmail(ctx, account.email);
      if (!user) {
        missingUsers++;
        continue;
      }

      await ensureUserProfile(ctx, user._id, account);
      ensuredCount++;
    }

    const summary = [`Ensured roles for ${ensuredCount} test accounts.`];
    if (missingUsers > 0) {
      summary.push(`${missingUsers} account(s) were missing user documents.`);
    }
    return summary.join(" ");
  },
});

// Create test user accounts (for development only)
export const createTestUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const scrypt = new Scrypt();

    let createdUsers = 0;
    let createdAccounts = 0;
    let updatedAccounts = 0;
    let profilesTouched = 0;

    for (const account of TEST_ACCOUNTS) {
      const { userId, created } = await ensureUserDocument(ctx, account);
      if (created) {
        createdUsers++;
      }

      const accountResult = await ensurePasswordAccount(ctx, userId, account, scrypt);
      if (accountResult === "created") {
        createdAccounts++;
      } else if (accountResult === "updated") {
        updatedAccounts++;
      }

      await ensureUserProfile(ctx, userId, account);
      profilesTouched++;
    }

    return `Ensured ${TEST_ACCOUNTS.length} test users (${createdUsers} new, ${createdAccounts} logins created, ${updatedAccounts} logins updated, ${profilesTouched} profiles synced).`;
  },
});

async function findUserByEmail(ctx: MutationCtx, email: string) {
  return await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", email))
    .first();
}

function getDisplayName(account: TestAccount) {
  return `${account.firstName} ${account.lastName}`.trim();
}

async function ensureUserDocument(ctx: MutationCtx, account: TestAccount) {
  const existingUser = await findUserByEmail(ctx, account.email);
  if (existingUser) {
    const patchData: Partial<Doc<"users">> = {};
    const desiredName = getDisplayName(account);
    if (existingUser.name !== desiredName) {
      patchData.name = desiredName;
    }
    if (!existingUser.emailVerificationTime) {
      patchData.emailVerificationTime = Date.now();
    }
    if (Object.keys(patchData).length > 0) {
      await ctx.db.patch(existingUser._id, patchData);
    }
    return { userId: existingUser._id, created: false };
  }

  const userId = await ctx.db.insert("users", {
    email: account.email,
    name: getDisplayName(account),
    emailVerificationTime: Date.now(),
  });

  return { userId, created: true };
}

async function ensurePasswordAccount(
  ctx: MutationCtx,
  userId: Id<"users">,
  account: TestAccount,
  scrypt: Scrypt
) {
  const existingAccount = await ctx.db
    .query("authAccounts")
    .withIndex("providerAndAccountId", (q) =>
      q.eq("provider", PASSWORD_PROVIDER_ID).eq("providerAccountId", account.email)
    )
    .first();

  const hashed = await scrypt.hash(account.password);

  if (existingAccount) {
    await ctx.db.patch(existingAccount._id, {
      userId,
      secret: hashed,
      emailVerified: account.email,
    });
    return "updated" as const;
  }

  await ctx.db.insert("authAccounts", {
    userId,
    provider: PASSWORD_PROVIDER_ID,
    providerAccountId: account.email,
    secret: hashed,
    emailVerified: account.email,
  });

  return "created" as const;
}

async function ensureUserProfile(
  ctx: MutationCtx,
  userId: Id<"users">,
  account: TestAccount
) {
  const existingProfile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  const profileData: Partial<Doc<"userProfiles">> & {
    userId: Id<"users">;
    role: Role;
    isActive: boolean;
    permissions: string[];
  } = {
    userId,
    role: account.role,
    firstName: account.firstName,
    lastName: account.lastName,
    isActive: true,
    permissions: getDefaultPermissions(account.role),
  };

  if (account.role !== "customer") {
    profileData.hireDate = existingProfile?.hireDate ?? Date.now();
  }

  if (existingProfile) {
    await ctx.db.patch(existingProfile._id, profileData);
    return "updated" as const;
  }

  await ctx.db.insert("userProfiles", profileData);
  return "created" as const;
}

function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case "admin":
      return [
        "admin:all",
        "orders:manage",
        "menu:manage", 
        "staff:manage",
        "inventory:manage",
        "reports:view",
        "settings:manage"
      ];
    case "manager":
      return [
        "orders:manage",
        "menu:manage",
        "staff:view",
        "inventory:manage", 
        "reports:view"
      ];
    case "barista":
      return [
        "orders:view",
        "orders:update_status",
        "inventory:view"
      ];
    case "customer":
    default:
      return [
        "orders:create",
        "orders:view_own",
        "reviews:create"
      ];
  }
}
