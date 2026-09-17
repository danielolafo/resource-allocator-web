import { addDays, toIsoDate } from '../models/assignment';
import { Employee } from '../models/employee';
import { Project } from '../models/project';
import { Technology } from '../models/technology';
import { Assignment } from '../models/assignment';

const today = new Date();

export const dateFromNow = (days: number): string => toIsoDate(addDays(today, days));

export const MOCK_TECHNOLOGIES: Technology[] = [
  { id: 1, name: 'Angular', category: 'Frontend', version: '21', description: 'Framework de aplicaciones web de Google.' },
  { id: 2, name: 'React', category: 'Frontend', version: '19', description: 'Librería de interfaces de usuario de Meta.' },
  { id: 3, name: 'Vue', category: 'Frontend', version: '3.5', description: 'Framework progresivo para interfaces de usuario.' },
  { id: 4, name: 'TypeScript', category: 'Lenguaje', version: '5.9', description: 'Superset tipado de JavaScript.' },
  { id: 5, name: 'Node.js', category: 'Backend', version: '22', description: 'Entorno de ejecución de JavaScript.' },
  { id: 6, name: '.NET', category: 'Backend', version: '9', description: 'Framework de Microsoft para desarrollo de software.' },
  { id: 7, name: 'Java', category: 'Backend', version: '21', description: 'Lenguaje de programación orientado a objetos.' },
  { id: 8, name: 'Python', category: 'Backend', version: '3.13', description: 'Lenguaje de programación multipropósito.' },
  { id: 9, name: 'SQL Server', category: 'Base de datos', version: '2022', description: 'Motor de base de datos relacional de Microsoft.' },
  { id: 10, name: 'PostgreSQL', category: 'Base de datos', version: '17', description: 'Sistema de base de datos relacional de código abierto.' },
  { id: 11, name: 'Docker', category: 'DevOps', version: '27', description: 'Plataforma de contenedores.' },
  { id: 12, name: 'Azure', category: 'DevOps', version: '2024', description: 'Plataforma de computación en la nube de Microsoft.' },
];

const RAW_EMPLOYEES: Omit<Employee, 'costPerDay'>[] = [
  {
    id: 1,
    firstName: 'María',
    lastName: 'Gómez',
    email: 'maria.gomez@empresa.com',
    position: 'Desarrolladora Frontend',
    hireDate: dateFromNow(-2200),
    technologies: [
      { technologyId: 1, level: 'Experto', version: '21', yearsExperience: 6 },
      { technologyId: 4, level: 'Experto', version: '5.9', yearsExperience: 6 },
      { technologyId: 3, level: 'Avanzado', version: '3.5', yearsExperience: 3 },
    ],
  },
  {
    id: 2,
    firstName: 'Carlos',
    lastName: 'Ruiz',
    email: 'carlos.ruiz@empresa.com',
    position: 'Desarrollador Backend',
    hireDate: dateFromNow(-1800),
    technologies: [
      { technologyId: 5, level: 'Experto', version: '22', yearsExperience: 7 },
      { technologyId: 10, level: 'Avanzado', version: '17', yearsExperience: 4 },
      { technologyId: 4, level: 'Avanzado', version: '5.9', yearsExperience: 5 },
    ],
  },
  {
    id: 3,
    firstName: 'Ana',
    lastName: 'López',
    email: 'ana.lopez@empresa.com',
    position: 'Ingeniera de Software',
    hireDate: dateFromNow(-1200),
    technologies: [
      { technologyId: 7, level: 'Avanzado', version: '21', yearsExperience: 4 },
      { technologyId: 8, level: 'Avanzado', version: '3.13', yearsExperience: 3 },
      { technologyId: 9, level: 'Medio', version: '2022', yearsExperience: 2 },
    ],
  },
  {
    id: 4,
    firstName: 'Luis',
    lastName: 'Martínez',
    email: 'luis.martinez@empresa.com',
    position: 'Desarrollador Full Stack',
    hireDate: dateFromNow(-900),
    technologies: [
      { technologyId: 1, level: 'Avanzado', version: '21', yearsExperience: 3 },
      { technologyId: 5, level: 'Avanzado', version: '22', yearsExperience: 4 },
      { technologyId: 10, level: 'Medio', version: '17', yearsExperience: 2 },
      { technologyId: 4, level: 'Avanzado', version: '5.9', yearsExperience: 4 },
    ],
  },
  {
    id: 5,
    firstName: 'Elena',
    lastName: 'Sánchez',
    email: 'elena.sanchez@empresa.com',
    position: 'Especialista en Bases de Datos',
    hireDate: dateFromNow(-2000),
    technologies: [
      { technologyId: 9, level: 'Experto', version: '2022', yearsExperience: 8 },
      { technologyId: 10, level: 'Experto', version: '17', yearsExperience: 7 },
    ],
  },
  {
    id: 6,
    firstName: 'Jorge',
    lastName: 'Díaz',
    email: 'jorge.diaz@empresa.com',
    position: 'Desarrolladora Frontend',
    hireDate: dateFromNow(-700),
    technologies: [
      { technologyId: 2, level: 'Avanzado', version: '19', yearsExperience: 3 },
      { technologyId: 4, level: 'Medio', version: '5.9', yearsExperience: 2 },
    ],
  },
  {
    id: 7,
    firstName: 'Laura',
    lastName: 'Fernández',
    email: 'laura.fernandez@empresa.com',
    position: 'DevOps Engineer',
    hireDate: dateFromNow(-1500),
    technologies: [
      { technologyId: 11, level: 'Experto', version: '27', yearsExperience: 6 },
      { technologyId: 12, level: 'Avanzado', version: '2024', yearsExperience: 4 },
      { technologyId: 5, level: 'Medio', version: '22', yearsExperience: 3 },
    ],
  },
  {
    id: 8,
    firstName: 'Pedro',
    lastName: 'Moreno',
    email: 'pedro.moreno@empresa.com',
    position: 'Desarrollador .NET',
    hireDate: dateFromNow(-1100),
    technologies: [
      { technologyId: 6, level: 'Experto', version: '9', yearsExperience: 6 },
      { technologyId: 9, level: 'Avanzado', version: '2022', yearsExperience: 4 },
      { technologyId: 4, level: 'Medio', version: '5.9', yearsExperience: 2 },
    ],
  },
  {
    id: 9,
    firstName: 'Sofía',
    lastName: 'Ortega',
    email: 'sofia.ortega@empresa.com',
    position: 'Desarrolladora Java',
    hireDate: dateFromNow(-1300),
    technologies: [
      { technologyId: 7, level: 'Experto', version: '21', yearsExperience: 7 },
      { technologyId: 10, level: 'Medio', version: '17', yearsExperience: 2 },
      { technologyId: 11, level: 'Medio', version: '27', yearsExperience: 1 },
    ],
  },
  {
    id: 10,
    firstName: 'Miguel',
    lastName: 'Torres',
    email: 'miguel.torres@empresa.com',
    position: 'Científico de Datos',
    hireDate: dateFromNow(-600),
    technologies: [
      { technologyId: 8, level: 'Experto', version: '3.13', yearsExperience: 5 },
      { technologyId: 10, level: 'Avanzado', version: '17', yearsExperience: 3 },
    ],
  },
  {
    id: 11,
    firstName: 'Carmen',
    lastName: 'Navarro',
    email: 'carmen.navarro@empresa.com',
    position: 'Desarrolladora React',
    hireDate: dateFromNow(-500),
    technologies: [
      { technologyId: 2, level: 'Experto', version: '19', yearsExperience: 4 },
      { technologyId: 4, level: 'Avanzado', version: '5.9', yearsExperience: 4 },
      { technologyId: 5, level: 'Medio', version: '22', yearsExperience: 2 },
    ],
  },
  {
    id: 12,
    firstName: 'Rafael',
    lastName: 'Castro',
    email: 'rafael.castro@empresa.com',
    position: 'Arquitecto de Software',
    hireDate: dateFromNow(-3000),
    technologies: [
      { technologyId: 6, level: 'Experto', version: '9', yearsExperience: 10 },
      { technologyId: 7, level: 'Avanzado', version: '21', yearsExperience: 6 },
      { technologyId: 8, level: 'Avanzado', version: '3.13', yearsExperience: 5 },
      { technologyId: 12, level: 'Avanzado', version: '2024', yearsExperience: 4 },
    ],
  },
  {
    id: 13,
    firstName: 'Lucía',
    lastName: 'Ramos',
    email: 'lucia.ramos@empresa.com',
    position: 'Desarrolladora Backend',
    hireDate: dateFromNow(-800),
    technologies: [
      { technologyId: 5, level: 'Avanzado', version: '22', yearsExperience: 3 },
      { technologyId: 10, level: 'Avanzado', version: '17', yearsExperience: 3 },
    ],
  },
  {
    id: 14,
    firstName: 'Andrés',
    lastName: 'Suárez',
    email: 'andres.suarez@empresa.com',
    position: 'Desarrollador Frontend',
    hireDate: dateFromNow(-400),
    technologies: [
      { technologyId: 3, level: 'Avanzado', version: '3.5', yearsExperience: 2 },
      { technologyId: 4, level: 'Medio', version: '5.9', yearsExperience: 2 },
    ],
  },
];

const BASE_DAILY_RATE = 180;
const rateByExperience = (employee: Omit<Employee, 'costPerDay'>): number =>
  BASE_DAILY_RATE +
  Math.round(Math.max(0, ...employee.technologies.map((tech) => tech.yearsExperience)) * 40);

export const MOCK_EMPLOYEES: Employee[] = RAW_EMPLOYEES.map((employee) => ({
  ...employee,
  costPerDay: rateByExperience(employee),
}));

export const MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'Portal Bancario',
    description: 'Portal web transaccional para clientes de banca digital.',
    client: 'Banco Nacional',
    status: 'Activo',
    startDate: dateFromNow(-200),
    endDate: dateFromNow(60),
    requiredTechnologies: [
      { technologyId: 1, minLevel: 'Avanzado', minYearsExperience: 2 },
      { technologyId: 4, minLevel: 'Medio', minYearsExperience: 1 },
      { technologyId: 9, minLevel: 'Medio', minYearsExperience: 2 },
    ],
  },
  {
    id: 2,
    name: 'App de Comercio Móvil',
    description: 'Aplicación móvil y backend para tienda en línea.',
    client: 'RetailMax',
    status: 'Activo',
    startDate: dateFromNow(-90),
    endDate: dateFromNow(25),
    requiredTechnologies: [
      { technologyId: 2, minLevel: 'Avanzado', minYearsExperience: 2 },
      { technologyId: 5, minLevel: 'Avanzado', minYearsExperience: 2 },
    ],
  },
  {
    id: 3,
    name: 'ERP Corporativo',
    description: 'Migración y modernización de ERP interno.',
    client: 'Consultores Integrales',
    status: 'Activo',
    startDate: dateFromNow(-60),
    endDate: dateFromNow(150),
    requiredTechnologies: [
      { technologyId: 6, minLevel: 'Experto', minYearsExperience: 4 },
      { technologyId: 9, minLevel: 'Avanzado', minYearsExperience: 3 },
    ],
  },
  {
    id: 4,
    name: 'Plataforma de Datos',
    description: 'Construcción de un data warehouse analítico.',
    client: 'Telecom Global',
    status: 'Activo',
    startDate: dateFromNow(-140),
    endDate: dateFromNow(12),
    requiredTechnologies: [
      { technologyId: 8, minLevel: 'Avanzado', minYearsExperience: 3 },
      { technologyId: 10, minLevel: 'Avanzado', minYearsExperience: 2 },
    ],
  },
  {
    id: 5,
    name: 'Sistema de Pagos',
    description: 'Pasarela de pagos de alta disponibilidad.',
    client: 'Fintech Solutions',
    status: 'En planificación',
    startDate: dateFromNow(20),
    endDate: dateFromNow(200),
    requiredTechnologies: [
      { technologyId: 7, minLevel: 'Experto', minYearsExperience: 5 },
      { technologyId: 10, minLevel: 'Avanzado', minYearsExperience: 3 },
      { technologyId: 11, minLevel: 'Medio', minYearsExperience: 1 },
    ],
  },
  {
    id: 6,
    name: 'Portal de Recursos Humanos',
    description: 'Intranet para gestión de personal.',
    client: 'Grupo Andino',
    status: 'Activo',
    startDate: dateFromNow(-30),
    endDate: dateFromNow(40),
    requiredTechnologies: [
      { technologyId: 3, minLevel: 'Avanzado', minYearsExperience: 1 },
      { technologyId: 5, minLevel: 'Medio', minYearsExperience: 1 },
    ],
  },
  {
    id: 7,
    name: 'Migración a la Nube',
    description: 'Migración de infraestructura a Azure.',
    client: 'Seguros Vida',
    status: 'Activo',
    startDate: dateFromNow(-45),
    endDate: dateFromNow(18),
    requiredTechnologies: [
      { technologyId: 12, minLevel: 'Avanzado', minYearsExperience: 3 },
      { technologyId: 11, minLevel: 'Avanzado', minYearsExperience: 2 },
    ],
  },
  {
    id: 8,
    name: 'API de Logística',
    description: 'APIs de seguimiento y despacho de paquetes.',
    client: 'LogiExpress',
    status: 'En planificación',
    startDate: dateFromNow(10),
    endDate: dateFromNow(120),
    requiredTechnologies: [
      { technologyId: 5, minLevel: 'Avanzado', minYearsExperience: 2 },
      { technologyId: 10, minLevel: 'Medio', minYearsExperience: 1 },
      { technologyId: 4, minLevel: 'Medio', minYearsExperience: 1 },
    ],
  },
];

let nextAssignmentId = 100;
const nextId = (): number => {
  nextAssignmentId += 1;
  return nextAssignmentId;
};

export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: nextId(), employeeId: 1, projectId: 1, mode: 'HORAS', hoursPerDay: 8, startDate: dateFromNow(-200), endDate: dateFromNow(8), notes: 'Asignada al módulo de transacciones.' },
  { id: nextId(), employeeId: 11, projectId: 2, mode: 'HORAS', hoursPerDay: 6, startDate: dateFromNow(-90), endDate: dateFromNow(12), notes: 'Frontend del carrito.' },
  { id: nextId(), employeeId: 8, projectId: 3, mode: 'RANGO', startDate: dateFromNow(-60), endDate: dateFromNow(150), notes: 'Líder técnico .NET.' },
  { id: nextId(), employeeId: 10, projectId: 4, mode: 'RANGO', startDate: dateFromNow(-140), endDate: dateFromNow(10), notes: 'Modelado del datamart.' },
  { id: nextId(), employeeId: 5, projectId: 4, mode: 'RANGO', startDate: dateFromNow(-140), endDate: dateFromNow(10), notes: 'Diseño del esquema.' },
  { id: nextId(), employeeId: 7, projectId: 7, mode: 'HORAS', hoursPerDay: 4, startDate: dateFromNow(-45), endDate: dateFromNow(15), notes: 'Automatización de despliegues.' },
  { id: nextId(), employeeId: 14, projectId: 6, mode: 'HORAS', hoursPerDay: 7, startDate: dateFromNow(-30), endDate: dateFromNow(40), notes: 'Interfaz de la intranet.' },
  { id: nextId(), employeeId: 13, projectId: 2, mode: 'HORAS', hoursPerDay: 5, startDate: dateFromNow(-90), endDate: dateFromNow(25), notes: 'APIs de pedidos.' },
  { id: nextId(), employeeId: 9, projectId: 5, mode: 'RANGO', startDate: dateFromNow(-120), endDate: dateFromNow(-40), notes: 'Asignación previa a planificación.' },
  { id: nextId(), employeeId: 3, projectId: 3, mode: 'RANGO', startDate: dateFromNow(-60), endDate: dateFromNow(-10), notes: 'Soporte durante UAT.' },
  { id: nextId(), employeeId: 12, projectId: 5, mode: 'RANGO', startDate: dateFromNow(-45), endDate: dateFromNow(60), notes: 'Definición de arquitectura.' },
  { id: nextId(), employeeId: 2, projectId: 8, mode: 'HORAS', hoursPerDay: 8, startDate: dateFromNow(2), endDate: dateFromNow(92), notes: 'Desarrollo de APIs (programada).' },
  { id: nextId(), employeeId: 4, projectId: 1, mode: 'HORAS', hoursPerDay: 8, startDate: dateFromNow(-200), endDate: dateFromNow(-15), notes: 'Finalizada.' },
];