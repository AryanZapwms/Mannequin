import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAddresses, createAddress, type AddressType } from "@/lib/services/address";

const ADDRESS_TYPES: AddressType[] = ["billing", "shipping"];

function isAddressType(value: unknown): value is AddressType {
  return typeof value === "string" && (ADDRESS_TYPES as string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const typeParam = request.nextUrl.searchParams.get("type");
  const type = isAddressType(typeParam) ? typeParam : undefined;

  const addresses = await getAddresses(user.id, type);
  return NextResponse.json({ addresses });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!isAddressType(body?.type)) {
    return NextResponse.json({ error: "A valid address type is required" }, { status: 400 });
  }

  const required = ["full_name", "phone", "street_address", "city", "state", "postal_code"] as const;
  for (const field of required) {
    if (typeof body?.[field] !== "string" || !body[field].trim()) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const address = await createAddress(user.id, {
    type: body.type,
    full_name: body.full_name,
    phone: body.phone,
    street_address: body.street_address,
    city: body.city,
    state: body.state,
    postal_code: body.postal_code,
    country: typeof body.country === "string" && body.country ? body.country : "India",
    is_default: Boolean(body.is_default),
  });

  return NextResponse.json({ address });
}
