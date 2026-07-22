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
      summary: { totalCases, openCases, closedCases },
      statusDistribution: statusGroups.map(g => ({ name: g.status, value: g._count.case_id })),
      typeDistribution: typeGroups.map(g => ({ name: g.type, value: g.count }))
    });
  } catch (error: any) {
    console.error('Failed to fetch dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
}
