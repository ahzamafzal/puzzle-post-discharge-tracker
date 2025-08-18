// Puzzle Post‑Discharge Tracker React component
//
// This file contains the full implementation of the tracker UI from the
// canvas prototype. It depends on the shadcn/ui component library,
// lucide-react icons, and recharts for charts. Install those
// dependencies before using this component.

import React, { useState, useMemo } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Switch, Badge, Progress,
  Tooltip, TooltipProvider, TooltipTrigger, TooltipContent,
  Button
} from '@/components/ui';
import {
  Building2, ChevronRight, Activity, Hospital, Home,
  Search, Bell, Eye, EyeOff, AlertTriangle,
  ClipboardList, CheckCircle2, PhoneCall, Shield
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip as RTooltip } from 'recharts';

// Mock data
const HEALTH_SYSTEMS = [
  { id: 'hs1', name: 'Corewell Health East' },
  { id: 'hs2', name: 'OSF HealthCare' },
  { id: 'hs3', name: 'Adventist Health – Maryland' },
];
const SNF_CHAINS = [
  { id: 'c1', name: 'Prestige' },
  { id: 'c2', name: 'Majestic' },
  { id: 'c3', name: 'Stellar' },
];
const FACILITIES = [
  { id: 'f1', chainId: 'c1', name: 'Prestige – Danville', address: 'Danville, IL', bedCount: 110, engagement: 82, census: 24, highRiskPct: 0.29, lastAckMin: 21, readmit30: 0.09, readmit60: 0.14, readmit90: 0.18 },
  { id: 'f2', chainId: 'c1', name: 'Prestige – Pontiac', address: 'Pontiac, IL', bedCount: 96, engagement: 74, census: 18, highRiskPct: 0.31, lastAckMin: 47, readmit30: 0.11, readmit60: 0.16, readmit90: 0.20 },
  { id: 'f3', chainId: 'c2', name: 'Majestic – Bloomington', address: 'Bloomington, IL', bedCount: 120, engagement: 65, census: 31, highRiskPct: 0.36, lastAckMin: 62, readmit30: 0.13, readmit60: 0.17, readmit90: 0.22 },
  { id: 'f4', chainId: 'c3', name: 'Stellar – Scioto', address: 'Ohio', bedCount: 88, engagement: 70, census: 16, highRiskPct: 0.25, lastAckMin: 33, readmit30: 0.10, readmit60: 0.15, readmit90: 0.19 },
];
const names = [
  'Ruth Alvarez', 'David Chen', 'Khadija Khan', 'Marcus Taylor', 'Ana Patel',
  'George Ibrahim', 'Salma Amin', 'John Smith', 'M. Rodriguez', 'Henry Cho',
];
const genVitals = () => Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  hr: 68 + Math.round(Math.sin(i / 2) * 5 + (i > 9 ? 5 : 0)),
  rr: 16 + Math.round(Math.cos(i / 3) * 2 + (i > 10 ? 2 : 0)),
  spo2: 95 - (i > 11 ? 2 : 0) - (i % 7 === 0 ? 1 : 0),
}));
const RISK = n => (n >= 70 ? 'High' : n >= 40 ? 'Medium' : 'Low');
const riskColor = tier => (tier === 'High' ? 'destructive' : tier === 'Medium' ? 'default' : 'secondary');
const PATIENTS = Array.from({ length: 26 }, (_, i) => {
  const facility = FACILITIES[i % FACILITIES.length];
  const riskScore = 30 + ((i * 13) % 70);
  const atHome = i % 3 === 0;
  const hospice = i === 7;
  const ama = i === 12;
  return {
    id: `p${i + 1}`,
    name: names[i % names.length] + (i > 19 ? ` Jr.` : ``),
    mrn: `MRN-${10000 + i}`,
    facilityId: facility.id,
    payer: i % 4 === 0 ? 'MA' : i % 4 === 1 ? 'FFS' : i % 4 === 2 ? 'Commercial' : 'Dual',
    riskScore,
    riskTier: hospice ? 'Low' : RISK(riskScore),
    atHome,
    hospice,
    ama,
    nextAppt: atHome ? 'PCP 7d' : i % 2 ? 'Therapy' : 'Specialist',
    alerts: [
      ...(riskScore > 70 ? [{ id: `a${i}-1`, severity: 'High', type: 'RPM abnormal', created: '2h' }] : []),
      ...(i % 5 === 0 ? [{ id: `a${i}-2`, severity: 'Medium', type: 'Missed weekly call', created: '1d' }] : []),
    ],
    vitals: genVitals(),
    encounters: [
      { type: 'Hospital', label: 'Admit', dt: '2025-07-12' },
      { type: 'Hospital', label: 'Discharge → SNF', dt: '2025-07-18' },
      { type: 'SNF', label: 'SNF LOS', dt: '2025-07-18 → 2025-08-03' },
      { type: atHome ? 'Home' : 'SNF', label: atHome ? '90-day program' : 'Current SNF', dt: atHome ? 'since 2025-08-03' : 'in-facility' },
    ],
    tasks: [
      { id: `t${i}-1`, title: 'Med Rec', status: i % 2 ? 'Done' : 'Open' },
      { id: `t${i}-2`, title: 'PCP within 7 days', status: i % 3 ? 'Open' : 'Scheduled' },
    ],
    interventions: [
      { when: '2025-08-10', type: 'Education', by: 'Puzzle CM', note: 'Low‑sodium diet coaching' },
      ...(riskScore > 70 ? [{ when: '2025-08-15', type: 'Escalation', by: 'Puzzle CM', note: 'SpO2 trending low; notified SNF nurse' }] : []),
    ],
  };
});
const mask = (on, value) => (on ? '•••' : value);
function calcRTH(patients, facilityId) {
  const cohort = patients.filter(p => (facilityId ? p.facilityId === facilityId : true));
  const n = cohort.length || 1;
  const r30 = cohort.filter(p => p.riskScore > 65).length / n * 0.3 + 0.07;
  const r60 = r30 + 0.05;
  const r90 = r60 + 0.04;
  return { r30: Math.min(r30, 0.22), r60: Math.min(r60, 0.28), r90: Math.min(r90, 0.34) };
}
function engagementScore(f) {
  const base = f.engagement;
  return Math.max(35, Math.min(95, base - Math.round(f.lastAckMin / 8) + Math.round((1 - f.highRiskPct) * 10)));
}
const TierBadge = ({ tier }) => <Badge variant={riskColor(tier)} className="rounded-xl">{tier}</Badge>;
const KPI = ({ label, value, icon }) => (
  <Card className="shadow-sm">
    <CardContent className="p-4 flex items-center gap-3">
      <div className="p-2 rounded-xl bg-muted">{icon}</div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </CardContent>
  </Card>
);
function FacilityCard({ f, onOpen }) {
  const engage = engagementScore(f);
  const rth = calcRTH(PATIENTS, f.id);
  return (
    <Card className="hover:shadow-md transition cursor-pointer" onClick={onOpen}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="truncate pr-2">
            <Building2 className="h-4 w-4 inline mr-2" />{f.name}
          </span>
          <ChevronRight className="h-4 w-4" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div>Census</div>
          <div className="font-medium">{f.census}</div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div>High‑risk %</div>
          <div className="font-medium">{Math.round(f.highRiskPct * 100)}%</div>
        </div>
        <div className="text-sm">Engagement</div>
        <Progress value={engage} />
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-muted-foreground">RTH 30</div>
            <div className="font-semibold">{Math.round(rth.r30 * 100)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">RTH 60</div>
            <div className="font-semibold">{Math.round(rth.r60 * 100)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">RTH 90</div>
            <div className="font-semibold">{Math.round(rth.r90 * 100)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function PatientsTable({ rows, phiMask, onOpen }) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>MRN</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Alerts</TableHead>
            <TableHead>Next</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(p => (
            <TableRow key={p.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => onOpen(p)}>
              <TableCell className="font-medium">{mask(phiMask, p.name)}</TableCell>
              <TableCell>{mask(phiMask, p.mrn)}</TableCell>
              <TableCell>{p.atHome ? <div className="flex items-center gap-1"><Home className="h-4 w-4" />Home (90‑day)</div> : p.facilityName}</TableCell>
              <TableCell className="space-x-2"><TierBadge tier={p.riskTier} /><span className="text-xs text-muted-foreground">{p.riskScore}</span></TableCell>
              <TableCell>
                {p.alerts.length ? (
                  <div className="flex flex-wrap gap-1">
                    {p.alerts.map(a => <Badge key={a.id} variant={a.severity === 'High' ? 'destructive' : 'default'}>{a.type}</Badge>)}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">None</span>
                )}
              </TableCell>
              <TableCell>{p.nextAppt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
function PatientModal({ open, onOpenChange, p, phiMask }) {
  if (!p) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {mask(phiMask, p.name)} <span className="text-muted-foreground font-normal">•</span> <span className="text-muted-foreground">{mask(phiMask, p.mrn)}</span>
            </span>
            <TierBadge tier={p.riskTier} />
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Vitals (last 14 days)</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={p.vitals}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RTooltip />
                    <Line type="monotone" dataKey="hr" />
                    <Line type="monotone" dataKey="rr" />
                    <Line type="monotone" dataKey="spo2" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Interventions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {p.interventions.map((it, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-muted flex items-start gap-3 text-sm">
                    <ClipboardList className="h-4 w-4 mt-0.5" />
                    <div>
                      <div className="font-medium">{it.when} • {it.type}</div>
                      <div className="text-muted-foreground">{it.by} — {it.note}</div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button size="sm"><PhoneCall className="h-4 w-4 mr-1" />Log outreach</Button>
                  <Button size="sm" variant="secondary"><AlertTriangle className="h-4 w-4 mr-1" />Resolve alert</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {p.encounters.map((e, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {e.type === 'Hospital' ? <Hospital className="h-4 w-4" /> : e.type === 'SNF' ? <Building2 className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-medium">{e.label}</span>
                      <span className="text-muted-foreground">{e.dt}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Tasks</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {p.tasks.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-xl bg-muted">
                    <div className="text-sm">{t.title}</div>
                    <Badge variant={t.status === 'Done' ? 'secondary' : 'default'}>{t.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Flags</CardTitle></CardHeader>
              <CardContent className="flex gap-2 flex-wrap">
                {p.hospice && <Badge variant="secondary">Hospice</Badge>}
                {p.ama && <Badge variant="default">Left AMA</Badge>}
                <Badge variant="outline">Payer: {p.payer}</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function HealthSystemView({ phiMask }) {
  const [query, setQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [patientOpen, setPatientOpen] = useState(false);
  const [activePatient, setActivePatient] = useState(null);
  const facility = FACILITIES.find(f => f.id === selectedFacility) || FACILITIES[0];
  const rth = calcRTH(PATIENTS);
  const patientsAtFacility = useMemo(() => PATIENTS.filter(p => p.facilityId === facility.id && !p.atHome).map(p => ({ ...p, facilityName: facility.name })).filter(p => (p.name + p.mrn + p.nextAppt).toLowerCase().includes(query.toLowerCase())), [facility.id, query]);
  const homeCohort = useMemo(() => PATIENTS.filter(p => p.atHome).map(p => ({ ...p, facilityName: FACILITIES.find(f => f.id === p.facilityId)?.name })).filter(p => (p.name + p.mrn + p.nextAppt).toLowerCase().includes(query.toLowerCase())), [query]);
  const kpi = {
    censusInSNF: PATIENTS.filter(p => !p.atHome).length,
    highRisk: PATIENTS.filter(p => p.riskTier === 'High').length,
    escalations7d: PATIENTS.reduce((acc, p) => acc + p.alerts.filter(a => a.severity !== '').length, 0),
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <KPI label="Current census (SNFs)" value={String(kpi.censusInSNF)} icon={<Building2 className="h-5 w-5" />} />
        <KPI label="High‑risk cohort" value={String(kpi.highRisk)} icon={<Activity className="h-5 w-5" />} />
        <KPI label="RTH 30 / 60 / 90" value={`${Math.round(rth.r30 * 100)}% / ${Math.round(rth.r60 * 100)}% / ${Math.round(rth.r90 * 100)}%`} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>
      <Tabs defaultValue="facilities">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="facilities">Discharge Destinations</TabsTrigger>
          <TabsTrigger value="patients">Patients at Facility</TabsTrigger>
          <TabsTrigger value="home">Home Cohort (90‑day)</TabsTrigger>
        </TabsList>
        <TabsContent value="facilities" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">Select facility:</div>
            <Select value={facility.id} onValueChange={v => setSelectedFacility(v)}>
              <SelectTrigger className="w-[320px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FACILITIES.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {FACILITIES.map(f => <FacilityCard key={f.id} f={f} onOpen={() => { setSelectedFacility(f.id); }} />)}
          </div>
        </TabsContent>
        <TabsContent value="patients" className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Facility:</div>
            <Select value={facility.id} onValueChange={v => setSelectedFacility(v)}>
              <SelectTrigger className="w-[320px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FACILITIES.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patients…" className="w-[260px]" value={query} onChange={e => setQuery(e.target.value)} />
            </div>
          </div>
          <PatientsTable rows={patientsAtFacility} phiMask={phiMask} onOpen={p => { setActivePatient(p); setPatientOpen(true); }} />
        </TabsContent>
        <TabsContent value="home" className="space-y-3">
          <div className="flex items-center gap-2 ml-auto justify-end">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search home cohort…" className="w-[260px]" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <PatientsTable rows={homeCohort} phiMask={phiMask} onOpen={p => { setActivePatient(p); setPatientOpen(true); }} />
        </TabsContent>
      </Tabs>
      <PatientModal open={patientOpen} onOpenChange={setPatientOpen} p={activePatient} phiMask={phiMask} />
    </div>
  );
}
function SNFChainView({ phiMask }) {
  const [chain, setChain] = useState(SNF_CHAINS[0].id);
  const facilities = FACILITIES.filter(f => f.chainId === chain);
  const rows = PATIENTS.filter(p => facilities.some(f => f.id === p.facilityId)).map(p => ({ ...p, facilityName: FACILITIES.find(f => f.id === p.facilityId)?.name })).sort((a, b) => (a.atHome === b.atHome ? b.riskScore - a.riskScore : a.atHome ? 1 : -1));
  const [patientOpen, setPatientOpen] = useState(false);
  const [activePatient, setActivePatient] = useState(null);
  const open = p => { setActivePatient(p); setPatientOpen(true); };
  const ackAvg = Math.round(facilities.reduce((a, f) => a + f.lastAckMin, 0) / Math.max(1, facilities.length));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <KPI label="Facilities in chain" value={String(facilities.length)} icon={<Building2 className="h-5 w-5" />} />
        <KPI label="Open escalations" value={String(rows.reduce((a, p) => a + p.alerts.length, 0))} icon={<Bell className="h-5 w-5" />} />
        <KPI label="Avg time to acknowledge" value={`${ackAvg} min`} icon={<CheckCircle2 className="h-5 w-5" />} />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">SNF Chain:</div>
        <Select value={chain} onValueChange={setChain}>
          <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SNF_CHAINS.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {facilities.map(f => <FacilityCard key={f.id} f={f} onOpen={() => {}} />)}
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">All Patients in Chain</CardTitle></CardHeader>
        <CardContent>
          <PatientsTable rows={rows} phiMask={phiMask} onOpen={open} />
        </CardContent>
      </Card>
      <PatientModal open={patientOpen} onOpenChange={setPatientOpen} p={activePatient} phiMask={phiMask} />
    </div>
  );
}
function SNFFacilityView({ phiMask }) {
  const [facilityId, setFacilityId] = useState(FACILITIES[0].id);
  const f = FACILITIES.find(x => x.id === facilityId);
  const admits = PATIENTS.filter(p => p.facilityId === facilityId && !p.atHome).slice(0, 3);
  const discharges = PATIENTS.filter(p => p.facilityId === facilityId && p.atHome).slice(0, 3);
  const escalations = PATIENTS.filter(p => p.facilityId === facilityId).flatMap(p => p.alerts.map(a => ({ ...a, patient: p })));
  const rows = PATIENTS.filter(p => p.facilityId === facilityId).map(p => ({ ...p, facilityName: f.name }));
  const [patientOpen, setPatientOpen] = useState(false);
  const [activePatient, setActivePatient] = useState(null);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <KPI label="Admits today" value={String(admits.length)} icon={<Hospital className="h-5 w-5" />} />
        <KPI label="Discharges planned" value={String(discharges.length)} icon={<Home className="h-5 w-5" />} />
        <KPI label="Open escalations" value={String(escalations.length)} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPI label="Engagement" value={`${engagementScore(f)}%`} icon={<CheckCircle2 className="h-5 w-5" />} />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">Facility:</div>
        <Select value={facilityId} onValueChange={setFacilityId}>
          <SelectTrigger className="w-[300px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FACILITIES.map(fac => <SelectItem key={fac.id} value={fac.id}>{fac.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {admits.map((p, i) => (
          <Card key={`adm${i}`}> <CardHeader className="pb-2"><CardTitle className="text-base">Admit: {mask(phiMask, p.name)}</CardTitle></CardHeader><CardContent>{p.payer}</CardContent></Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {discharges.map((p, i) => (
          <Card key={`dis${i}`}> <CardHeader className="pb-2"><CardTitle className="text-base">Discharge: {mask(phiMask, p.name)}</CardTitle></CardHeader><CardContent>{p.payer}</CardContent></Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {escalations.map((a, i) => (
          <Card key={`esc${i}`}> <CardHeader className="pb-2"><CardTitle className="text-base">{a.type}</CardTitle></CardHeader><CardContent className="text-sm"><div>{a.severity} — {mask(phiMask, a.patient.name)}</div></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">All Patients</CardTitle></CardHeader>
        <CardContent>
          <PatientsTable rows={rows} phiMask={phiMask} onOpen={p => { setActivePatient(p); setPatientOpen(true); }} />
        </CardContent>
      </Card>
      <PatientModal open={patientOpen} onOpenChange={setPatientOpen} p={activePatient} phiMask={phiMask} />
    </div>
  );
}
function PuzzleTeamView({ phiMask }) {
  const [tab, setTab] = useState('triage');
  const triageBuckets = {
    High: PATIENTS.filter(p => p.riskTier === 'High'),
    Medium: PATIENTS.filter(p => p.riskTier === 'Medium'),
    Low: PATIENTS.filter(p => p.riskTier === 'Low'),
  };
  const [patientOpen, setPatientOpen] = useState(false);
  const [activePatient, setActivePatient] = useState(null);
  const open = p => { setActivePatient(p); setPatientOpen(true); };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <KPI label="Patients in program" value={String(PATIENTS.length)} icon={<ClipboardList className="h-5 w-5" />} />
        <KPI label="Open alerts" value={String(PATIENTS.reduce((a, p) => a + p.alerts.length, 0))} icon={<Bell className="h-5 w-5" />} />
        <KPI label="High‑risk" value={String(triageBuckets.High.length)} icon={<Activity className="h-5 w-5" />} />
        <KPI label="Hospice" value={String(PATIENTS.filter(p => p.hospice).length)} icon={<Shield className="h-5 w-5" />} />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="triage">Triage Board</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="triage" className="space-y-4">
          {['High', 'Medium', 'Low'].map(tier => (
            <Card key={tier}>
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2">{tier} risk <TierBadge tier={tier} /></CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {triageBuckets[tier].slice(0, 6).map(p => (
                  <div key={p.id} className="p-3 bg-muted rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-medium">{mask(phiMask, p.name)}</div>
                      <div className="text-xs text-muted-foreground">{p.atHome ? 'Home 90‑day' : 'SNF'} • {FACILITIES.find(f => f.id === p.facilityId)?.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={riskColor(p.riskTier)}>{p.riskTier}</Badge>
                      <Button size="sm" onClick={() => open(p)}>Open</Button>
                    </div>
                  </div>
                )))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Alert Rules (demo)</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-muted flex items-center justify-between">
                <div>RPM abnormal sustained &gt; 30 min → High</div>
                <Switch defaultChecked />
              </div>
              <div className="p-3 rounded-xl bg-muted flex items-center justify-between">
                <div>Missed PCP within 7 days → Medium</div>
                <Switch defaultChecked />
              </div>
              <div className="p-3 rounded-xl bg-muted flex items-center justify-between">
                <div>New ED visit (ADT) → Critical</div>
                <Switch defaultChecked />
              </div>
              <div className="p-3 rounded-xl bg-muted flex items-center justify-between">
                <div>Hospice mode: suppress readmission score</div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Exports</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2">
              <Button>Generate Health System Report (PDF)</Button>
              <Button variant="secondary">Export RTH by Facility (CSV)</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">RTH Visualization</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3 text-sm">
              {FACILITIES.map(f => {
                const r = calcRTH(PATIENTS, f.id);
                return (
                  <div key={f.id} className="p-3 rounded-xl bg-muted">
                    <div className="font-medium mb-1">{f.name}</div>
                    <div className="flex items-center justify-between"><span>30‑day</span><span className="font-semibold">{Math.round(r.r30 * 100)}%</span></div>
                    <div className="flex items-center justify-between"><span>60‑day</span><span className="font-semibold">{Math.round(r.r60 * 100)}%</span></div>
                    <div className="flex items-center justify-between"><span>90‑day</span><span className="font-semibold">{Math.round(r.r90 * 100)}%</span></div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <PatientModal open={patientOpen} onOpenChange={setPatientOpen} p={activePatient} phiMask={phiMask} />
    </div>
  );
}
export default function PuzzlePostDischargeTracker() {
  const [role, setRole] = useState('health_system');
  const [org, setOrg] = useState(HEALTH_SYSTEMS[0].id);
  const [phiMask, setPhiMask] = useState(false);
  const roleName = role === 'health_system' ? 'Health System' : role === 'snf_chain' ? 'SNF Chain' : role === 'snf_facility' ? 'SNF Facility' : 'Puzzle Team';
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary/90" />
              <div className="font-semibold">Puzzle Post‑Discharge Tracker</div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-[170px]"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="health_system">Health System</SelectItem>
                  <SelectItem value="snf_chain">SNF Chain</SelectItem>
                  <SelectItem value="snf_facility">SNF Facility</SelectItem>
                  <SelectItem value="puzzle">Puzzle Team</SelectItem>
                </SelectContent>
              </Select>
              {role === 'health_system' && (
                <Select value={org} onValueChange={setOrg}>
                  <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HEALTH_SYSTEMS.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <div className="flex items-center gap-2 pl-3 border-l">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setPhiMask(!phiMask)}>
                      {phiMask ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>PHI mask (for screen‑share)</TooltipContent>
                </Tooltip>
                <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Current role</div>
              <div className="text-2xl font-semibold">{roleName}</div>
            </div>
            <div className="text-xs text-muted-foreground max-w-[520px] text-right">
              Clinical decision support disclaimer: Puzzle insights augment, not replace, clinical judgment. Alerts are not a substitute for emergency care.
            </div>
          </div>
          {role === 'health_system' && <HealthSystemView phiMask={phiMask} />}
          {role === 'snf_chain' && <SNFChainView phiMask={phiMask} />}
          {role === 'snf_facility' && <SNFFacilityView phiMask={phiMask} />}
          {role === 'puzzle' && <PuzzleTeamView phiMask={phiMask} />}
        </div>
      </div>
    </TooltipProvider>
  );
}
