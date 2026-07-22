import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export async function getDashboardMetrics(req: Request, res: Response) {
  try {
    const totalCases = await prisma.cases.count({
      where: { is_deleted: false }
    });

    const openCases = await prisma.cases.count({
      where: { is_deleted: false, status: 'OPEN' }
    });

    const closedCases = await prisma.cases.count({
      where: { is_deleted: false, status: 'CLOSED' }
    });

    const pendingInvestigations = await prisma.investigation.count({
      where: { status: 'PENDING' }
    });

    const pendingReports = await prisma.cases.count({
      where: { is_deleted: false, report: { none: {} } }
    });

    // Group by status
    const statusGroups = await prisma.cases.groupBy({
      by: ['status'],
      where: { is_deleted: false },
      _count: { case_id: true }
    });
    
    // Group by Case Type
    const typeGroupsRaw = await prisma.cases.groupBy({
      by: ['case_type_id'],
      where: { is_deleted: false },
      _count: { case_id: true }
    });
    
    const caseTypes = await prisma.case_type_lu.findMany();
    const caseTypeMap = new Map(caseTypes.map(t => [t.id, t.label]));

    const typeGroups = typeGroupsRaw.map(g => ({
      type: g.case_type_id ? (caseTypeMap.get(g.case_type_id) || 'Unknown') : 'Uncategorized',
      count: g._count.case_id
    }));

    res.json({
      summary: { totalCases, openCases, closedCases, pendingInvestigations, pendingReports },
      statusDistribution: statusGroups.map(g => ({ name: g.status, value: g._count.case_id })),
      typeDistribution: typeGroups.map(g => ({ name: g.type, value: g.count }))
    });
  } catch (error: any) {
    console.error('Failed to fetch dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
}

export async function getGlobalAuditLogs(req: Request, res: Response) {
  try {
    const { userId, action, entityType, startDate, endDate, page = '1', limit = '50' } = req.query;

    const where: any = {};
    if (userId) where.user_id = BigInt(userId as string);
    if (action) where.action = { contains: action as string };
    if (entityType) where.entity_type = entityType as string;
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.timestamp.lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [logs, total] = await Promise.all([
      prisma.audit_log.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take,
        include: { users: { select: { username: true, first_name: true, last_name: true } } }
      }),
      prisma.audit_log.count({ where })
    ]);

    res.json({
      data: logs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch global audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch global audit logs' });
  }
}
