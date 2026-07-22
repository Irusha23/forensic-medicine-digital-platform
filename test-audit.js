async function main() {
  try {
    const loginRes = await fetch('http://127.0.0.1:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'adminpass' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in.');

    const caseRes = await fetch('http://127.0.0.1:4000/api/cases', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        case_type_id: 1,
        case_number: 'AUDIT-TEST-001',
        full_name: 'Audit Test Subject',
        nic: '888877776V',
        gender: 'Male'
      })
    });
    const caseData = await caseRes.json();
    console.log('Case created:', caseData);
    const caseId = caseData.case_id;

    // Fetch audits for this case
    const auditRes = await fetch(`http://127.0.0.1:4000/api/cases/${caseId}/audit`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const auditData = await auditRes.json();
    console.log('Audit logs for case:', JSON.stringify(auditData, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
