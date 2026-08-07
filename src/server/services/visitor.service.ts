import type { Prisma } from "@/server/prisma/generated/client";

import { ConflictError, NotFoundError } from "@/server/api/errors";
import {
  createVisitorRecord,
  checkoutVisitorIfCheckedIn,
  deleteVisitorRecord,
  findVisitorById,
  generateNextVisitorCode,
  listVisitorRecords,
  runVisitorTransaction,
  updateVisitorRecord,
} from "@/server/repositories/visitor.repository";
import type {
  CreateVisitorInput,
  UpdateVisitorInput,
  VisitorListQuery,
  VisitorListResult,
  VisitorWithCreator,
} from "@/types/visitor";
import type {
  CreateVisitorFormValues,
  UpdateVisitorFormValues,
  VisitorListQueryValues,
} from "@/server/validation/visitor";
import {
  deleteVisitorPhotoFile,
  saveVisitorPhotoFromDataUrl,
} from "@/server/utils/visitor-photo";

function buildSearchFilter(search?: string): Prisma.VisitorWhereInput | undefined {
  if (!search) {
    return undefined;
  }

  const term = search.trim();
  if (!term) {
    return undefined;
  }

  return {
    OR: [
      { visitorCode: { contains: term, mode: "insensitive" } },
      { fullName: { contains: term, mode: "insensitive" } },
      { phone: { contains: term } },
    ],
  };
}

function buildListWhere(query: VisitorListQueryValues): Prisma.VisitorWhereInput {
  const filters: Prisma.VisitorWhereInput[] = [];
  const searchFilter = buildSearchFilter(query.search);

  if (searchFilter) {
    filters.push(searchFilter);
  }

  if (query.status && query.status !== "ALL") {
    filters.push({ status: query.status });
  }

  if (filters.length === 0) {
    return {};
  }

  return { AND: filters };
}

function buildListOrderBy(
  query: VisitorListQueryValues,
): Prisma.VisitorOrderByWithRelationInput {
  return {
    [query.sortBy]: query.sortOrder,
  };
}

export async function createVisitor(
  input: CreateVisitorInput | CreateVisitorFormValues,
  createdBy: string,
): Promise<VisitorWithCreator> {
  const visitor = await runVisitorTransaction(async (tx) => {
    const visitorCode = await generateNextVisitorCode(tx);

    return createVisitorRecord(tx, {
      visitorCode,
      fullName: input.fullName,
      phone: input.phone,
      company: input.company ?? null,
      address: input.address ?? null,
      purpose: input.purpose,
      personToMeet: input.personToMeet,
      idProofType: input.idProofType ?? null,
      idProofNumber: input.idProofNumber ?? null,
      vehicleType: input.vehicleType ?? null,
      vehicleNumber: input.vehicleNumber ?? null,
      additionalMembers: input.additionalMembers ?? 0,
      status: "CHECKED_IN",
      creator: { connect: { id: createdBy } },
    });
  });

  const photoDataUrl =
    "photoDataUrl" in input ? input.photoDataUrl : undefined;

  if (!photoDataUrl) {
    return visitor;
  }

  try {
    const photoUrl = await saveVisitorPhotoFromDataUrl(visitor.id, photoDataUrl);
    return await updateVisitorRecord(visitor.id, { photoUrl });
  } catch (error) {
    await deleteVisitorRecord(visitor.id).catch(() => undefined);
    throw error;
  }
}

export async function listVisitors(
  query: VisitorListQuery | VisitorListQueryValues,
): Promise<VisitorListResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const where = buildListWhere(query as VisitorListQueryValues);
  const orderBy = buildListOrderBy(query as VisitorListQueryValues);
  const skip = (page - 1) * pageSize;

  const { visitors, total } = await listVisitorRecords({
    where,
    orderBy,
    skip,
    take: pageSize,
  });

  return {
    visitors,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getVisitorById(id: string): Promise<VisitorWithCreator> {
  const visitor = await findVisitorById(id);

  if (!visitor) {
    throw new NotFoundError("Visitor");
  }

  return visitor;
}

export async function updateVisitor(
  id: string,
  input: UpdateVisitorInput | UpdateVisitorFormValues,
): Promise<VisitorWithCreator> {
  const existing = await getVisitorById(id);

  const data: Prisma.VisitorUpdateInput = {};

  if (input.fullName !== undefined) data.fullName = input.fullName;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.company !== undefined) data.company = input.company;
  if (input.address !== undefined) data.address = input.address;
  if (input.purpose !== undefined) data.purpose = input.purpose;
  if (input.personToMeet !== undefined) data.personToMeet = input.personToMeet;
  if (input.idProofType !== undefined) data.idProofType = input.idProofType;
  if (input.idProofNumber !== undefined) data.idProofNumber = input.idProofNumber;
  if (input.vehicleType !== undefined) data.vehicleType = input.vehicleType;
  if (input.vehicleNumber !== undefined) data.vehicleNumber = input.vehicleNumber;
  if (input.additionalMembers !== undefined) {
    data.additionalMembers = input.additionalMembers;
  }

  if (input.photoDataUrl === null) {
    await deleteVisitorPhotoFile(existing.photoUrl);
    data.photoUrl = null;
  } else if (input.photoDataUrl) {
    const photoUrl = await saveVisitorPhotoFromDataUrl(id, input.photoDataUrl);
    data.photoUrl = photoUrl;

    if (existing.photoUrl && existing.photoUrl !== photoUrl) {
      await deleteVisitorPhotoFile(existing.photoUrl);
    }
  }

  return updateVisitorRecord(id, data);
}

export async function deleteVisitor(id: string): Promise<void> {
  const visitor = await getVisitorById(id);
  await deleteVisitorPhotoFile(visitor.photoUrl);
  await deleteVisitorRecord(id);
}

export async function checkoutVisitor(id: string): Promise<VisitorWithCreator> {
  const checkOutTime = new Date();
  const result = await checkoutVisitorIfCheckedIn(id, checkOutTime);

  if (result.count === 0) {
    // Distinguish missing visitor vs already checked out for stable API errors.
    await getVisitorById(id);
    throw new ConflictError("This visitor has already been checked out.");
  }

  return getVisitorById(id);
}
