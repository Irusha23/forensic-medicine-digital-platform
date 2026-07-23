import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await prisma.patients.findMany({
      include: {
        cases: {
          include: {
            case_type_lu: true
          }
        }
      },
      orderBy: {
        patient_id: 'desc'
      }
    });

    // We can map the result to a more convenient format for the frontend
    const formattedPatients = patients.map(p => {
      // Find the most recent case or just any case to determine type
      // A patient typically has one case in this system, but it's an array
      const latestCase = p.cases && p.cases.length > 0 ? p.cases[p.cases.length - 1] : null;
      return {
        patient_id: p.patient_id.toString(),
        full_name: p.full_name,
        nic: p.nic,
        date_of_birth: p.date_of_birth,
        age: p.age,
        gender: p.gender,
        address: p.address,
        telephone: p.telephone,
        case_type: latestCase?.case_type_lu?.label || 'Unknown',
        case_id: latestCase?.case_id?.toString(),
        case_number: latestCase?.case_number
      };
    });

    res.json(formattedPatients);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
