import { dbConnect } from "@/lib/db/connect";
import { Address as AddressModel } from "@/lib/db/models/Address";

export type AddressType = "billing" | "shipping";

export interface UserAddress {
  id: string;
  user_id: string;
  type: AddressType;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

function toUserAddress(doc: any): UserAddress {
  return {
    id: doc._id.toString(),
    user_id: doc.userId.toString(),
    type: doc.type,
    full_name: doc.fullName,
    phone: doc.phone,
    street_address: doc.streetAddress,
    city: doc.city,
    state: doc.state,
    postal_code: doc.postalCode,
    country: doc.country,
    is_default: doc.isDefault,
    created_at: (doc.createdAt ?? new Date()).toISOString(),
    updated_at: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

export async function getAddresses(userId: string, type?: AddressType): Promise<UserAddress[]> {
  await dbConnect();
  const filter: Record<string, unknown> = { userId };
  if (type) filter.type = type;

  const docs = await AddressModel.find(filter).sort({ isDefault: -1, createdAt: -1 });
  return docs.map(toUserAddress);
}

export async function getDefaultAddress(
  userId: string,
  type: AddressType,
): Promise<UserAddress | null> {
  await dbConnect();
  const doc = await AddressModel.findOne({ userId, type, isDefault: true });
  return doc ? toUserAddress(doc) : null;
}

export async function createAddress(
  userId: string,
  address: Omit<UserAddress, "id" | "user_id" | "created_at" | "updated_at">,
): Promise<UserAddress> {
  await dbConnect();

  if (address.is_default) {
    await AddressModel.updateMany({ userId, type: address.type }, { isDefault: false });
  }

  const created = await AddressModel.create({
    userId,
    type: address.type,
    fullName: address.full_name,
    phone: address.phone,
    streetAddress: address.street_address,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
    isDefault: address.is_default,
  });

  return toUserAddress(created);
}

export async function updateAddress(
  userId: string,
  addressId: string,
  updates: Partial<Omit<UserAddress, "id" | "user_id" | "created_at" | "updated_at">>,
): Promise<UserAddress> {
  await dbConnect();

  const address = await AddressModel.findOne({ _id: addressId, userId });
  if (!address) throw new Error("Address not found");

  if (updates.is_default && !address.isDefault) {
    await AddressModel.updateMany(
      { userId: address.userId, type: address.type },
      { isDefault: false },
    );
  }

  if (updates.full_name !== undefined) address.fullName = updates.full_name;
  if (updates.phone !== undefined) address.phone = updates.phone;
  if (updates.street_address !== undefined) address.streetAddress = updates.street_address;
  if (updates.city !== undefined) address.city = updates.city;
  if (updates.state !== undefined) address.state = updates.state;
  if (updates.postal_code !== undefined) address.postalCode = updates.postal_code;
  if (updates.country !== undefined) address.country = updates.country;
  if (updates.is_default !== undefined) address.isDefault = updates.is_default;
  if (updates.type !== undefined) address.type = updates.type;

  await address.save();
  return toUserAddress(address);
}

export async function deleteAddress(userId: string, addressId: string): Promise<void> {
  await dbConnect();
  await AddressModel.findOneAndDelete({ _id: addressId, userId });
}

export async function setDefaultAddress(
  userId: string,
  addressId: string,
  type: AddressType,
): Promise<UserAddress> {
  await dbConnect();

  const address = await AddressModel.findOne({ _id: addressId, userId });
  if (!address) throw new Error("Address not found");

  await AddressModel.updateMany({ userId: address.userId, type }, { isDefault: false });

  address.isDefault = true;
  await address.save();
  return toUserAddress(address);
}
