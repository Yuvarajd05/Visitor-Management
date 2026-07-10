import type { Prisma, VisitorStatus } from "@/lib/generated/prisma/client";

import { ConflictError, NotFoundError } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import {
  generateNextVisitorCode,
  visitorListSelect,
  visitorWithCreatorSelect,
} from "@/lib/visitor-queries";
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
} from "@/utils/validation/visitor";

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
  return prisma.$transaction(async (tx) => {
    const visitorCode = await generateNextVisitorCode(tx);

    return tx.visitor.create({
      data: {
        visitorCode,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email ?? null,
        company: input.company,
        purpose: input.purpose,
        personToMeet: input.personToMeet,
        idProofType: input.idProofType,
        idProofNumber: input.idProofNumber,
        vehicleNumber: input.vehicleNumber ?? null,
        status: "CHECKED_IN",
        createdBy,
      },
      select: visitorWithCreatorSelect,
    });
  });
}

export async function listVisitors(
  query: VisitorListQuery | VisitorListQueryValues,
): Promise<VisitorListResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const where = buildListWhere(query as VisitorListQueryValues);
  const orderBy = buildListOrderBy(query as VisitorListQueryValues);
  const skip = (page - 1) * pageSize;

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: visitorListSelect,
    }),
    prisma.visitor.count({ where }),
  ]);

  return {
    visitors,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getVisitorById(id: string): Promise<VisitorWithCreator> {
  const visitor = await prisma.visitor.findUnique({
    where: { id },
    select: visitorWithCreatorSelect,
  });

  if (!visitor) {
    throw new NotFoundError("Visitor");
  }

  return visitor;
}

export async function updateVisitor(
  id: string,
  input: UpdateVisitorInput | UpdateVisitorFormValues,
): Promise<VisitorWithCreator> {
  await getVisitorById(id);

  const data: Prisma.VisitorUpdateInput = {};

  if (input.fullName !== undefined) data.fullName = input.fullName;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.email !== undefined) data.email = input.email;
  if (input.company !== undefined) data.company = input.company;
  if (input.purpose !== undefined) data.purpose = input.purpose;
  if (input.personToMeet !== undefined) data.personToMeet = input.personToMeet;
  if (input.idProofType !== undefined) data.idProofType = input.idProofType;
  if (input.idProofNumber !== undefined) data.idProofNumber = input.idProofNumber;
  if (input.vehicleNumber !== undefined) data.vehicleNumber = input.vehicleNumber;

  return prisma.visitor.update({
    where: { id },
    data,
    select: visitorWithCreatorSelect,
  });
}

export async function deleteVisitor(id: string): Promise<void> {
  await getVisitorById(id);

  await prisma.visitor.delete({
    where: { id },
  });
}

export async function checkoutVisitor(id: string): Promise<VisitorWithCreator> {
  const visitor = await getVisitorById(id);

  if (visitor.status === ("CHECKED_OUT" satisfies VisitorStatus)) {
    throw new ConflictError("This visitor has already been checked out.");
  }

  return prisma.visitor.update({
    where: { id },
    data: {
      status: "CHECKED_OUT",
      checkOutTime: new Date(),
    },
    select: visitorWithCreatorSelect,
  });
}
