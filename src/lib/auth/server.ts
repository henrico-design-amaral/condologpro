import { OperatorRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  decideAccess,
  type OperationalRole
} from "@/lib/auth/policy";
import { SupabaseConfigurationError } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthenticatedOperator = {
  id: string;
  authSubject: string;
  organizationId: string;
  name: string;
  role: OperationalRole;
  organization: {
    id: string;
    name: string;
  };
};

export type OperatorAuthentication =
  | { ok: true; operator: AuthenticatedOperator }
  | {
      ok: false;
      reason: "not-configured" | "anonymous" | "unlinked" | "inactive" | "role";
    };

export async function authenticateOperator(
  allowedRoles: readonly OperationalRole[]
): Promise<OperatorAuthentication> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();
    const authSubject = data?.claims?.sub;

    if (error || !authSubject) {
      return { ok: false, reason: "anonymous" };
    }

    const operator = await prisma.operator.findUnique({
      where: { authSubject },
      select: {
        id: true,
        authSubject: true,
        organizationId: true,
        name: true,
        role: true,
        isActive: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!operator || !operator.authSubject) {
      return { ok: false, reason: "unlinked" };
    }

    const decision = decideAccess(
      {
        role: operator.role as OperationalRole,
        isActive: operator.isActive,
        organizationId: operator.organizationId
      },
      allowedRoles
    );

    if (!decision.allowed) {
      return { ok: false, reason: decision.reason };
    }

    return {
      ok: true,
      operator: {
        id: operator.id,
        authSubject: operator.authSubject,
        organizationId: operator.organizationId,
        name: operator.name,
        role: operator.role as OperationalRole,
        organization: operator.organization
      }
    };
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return { ok: false, reason: "not-configured" };
    }

    throw error;
  }
}

export async function requirePageOperator(
  allowedRoles: readonly OperationalRole[],
  nextPath: string
) {
  const authentication = await authenticateOperator(allowedRoles);

  if (authentication.ok) {
    return authentication.operator;
  }

  if (authentication.reason === "anonymous" || authentication.reason === "not-configured") {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  redirect(`/forbidden?reason=${authentication.reason}`);
}

export async function authorizeApi(allowedRoles: readonly OperationalRole[]) {
  const authentication = await authenticateOperator(allowedRoles);

  if (authentication.ok) {
    return authentication;
  }

  const status =
    authentication.reason === "anonymous" || authentication.reason === "not-configured"
      ? 401
      : 403;

  return {
    ok: false as const,
    response: NextResponse.json(
      {
        error: status === 401 ? "Autenticação obrigatória." : "Acesso não autorizado."
      },
      {
        status,
        headers: {
          "Cache-Control": "private, no-store"
        }
      }
    )
  };
}

export function normalizeOperatorRole(role: OperatorRole): OperationalRole {
  return role as OperationalRole;
}
