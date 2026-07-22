import prisma from '../lib/prisma';

export async function createAuthorization(caseId: string | number, data: any) {
  return prisma.$transaction(async (tx) => {
    const auth = await tx.legal_authorizations.create({
      data: {
        case_id: BigInt(caseId),
        authorization_type: data.authorization_type,
        issue_date: data.issue_date ? new Date(data.issue_date) : null,
        issuing_authority: data.issuing_authority,
        remarks: data.remarks,
        details: data.details || {},
        document_id: data.document_id ? BigInt(data.document_id) : null
      }
    });

    if (data.authorization_type === 'COURT_ORDER') {
      await tx.court_order.create({
        data: {
          authorization_id: auth.authorization_id,
          court_order_number: data.court_order_number,
          court_case_number: data.court_case_number,
          court_name: data.court_name
        }
      });
    } else if (data.authorization_type === 'INQUEST_ORDER') {
      await tx.inquest_order.create({
        data: {
          authorization_id: auth.authorization_id,
          inquest_order_number: data.inquest_order_number,
          isd_officer_name: data.isd_officer_name,
          police_station: data.police_station
        }
      });
    } else if (data.authorization_type === 'SUMMON') {
      await tx.summon.create({
        data: {
          authorization_id: auth.authorization_id,
          MLEF_number: data.MLEF_number,
          court_case_number: data.court_case_number,
          court_date: data.court_date ? new Date(data.court_date) : null,
          court_name: data.court_name
        }
      });
    }

    return auth;
  });
}

export async function getAuthorizationsByCase(caseId: string | number) {
  return prisma.legal_authorizations.findMany({
    where: { case_id: BigInt(caseId) },
    include: {
      court_order: true,
      inquest_order: true,
      summon: true,
      documents: true
    },
    orderBy: { created_at: 'desc' }
  });
}
