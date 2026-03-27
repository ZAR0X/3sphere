export interface Entity {
  id: string;
  name: string;
  role: string;
}

export function useMockData() {
  const people = [
    { role: 'Frontend Developer', first: 'Alice', last: 'Johnson' },
    { role: 'UI/UX Designer', first: 'Bob', last: 'Smith' },
    { role: 'Data Scientist', first: 'Charlie', last: 'Davis' },
    { role: 'Project Manager', first: 'Diana', last: 'Lopez' },
    { role: 'Backend Engineer', first: 'Evan', last: 'Wright' },
    { role: 'QA Tester', first: 'Fiona', last: 'Gallagher' },
    { role: 'Marketing Lead', first: 'George', last: 'Mason' },
    { role: 'Support Specialist', first: 'Hannah', last: 'Abbott' },
    { role: 'DevOps Engineer', first: 'Ian', last: 'Chen' },
    { role: 'Product Owner', first: 'Julia', last: 'Roberts' },
    { role: 'Content Writer', first: 'Kevin', last: 'Hart' },
    { role: 'HR Manager', first: 'Linda', last: 'Evans' },
    { role: 'Regional Manager', first: 'Michael', last: 'Scott' },
    { role: 'Lead Designer', first: 'Nina', last: 'Dobrev' },
    { role: 'Security Analyst', first: 'Oscar', last: 'Diaz' },
    { role: 'Cloud Architect', first: 'Paul', last: 'Atreides' },
    { role: 'Social Media Manager', first: 'Quinn', last: 'Fabray' },
    { role: 'Sales Executive', first: 'Rachel', last: 'Green' },
    { role: 'Operations Director', first: 'Sam', last: 'Winchester' },
    { role: 'Customer Success', first: 'Tina', last: 'Cohen' },
    { role: 'Full Stack Engineer', first: 'Uma', last: 'Thurman' },
    { role: 'Hardware Engineer', first: 'Victor', last: 'Stone' },
    { role: 'Mobile Developer', first: 'Wendy', last: 'Wu' },
    { role: 'DB Administrator', first: 'Xavier', last: 'Woods' },
    { role: 'QA Engineer', first: 'Yara', last: 'Shahidi' },
    { role: 'IT Support', first: 'Zachary', last: 'Levi' },
    { role: 'Business Analyst', first: 'Alyssa', last: 'Milano' },
    { role: 'Logistics Coordinator', first: 'Brian', last: "O'Conner" },
    { role: 'Legal Advisor', first: 'Chloe', last: 'Decker' },
    { role: 'Creative Director', first: 'David', last: 'Rose' },
  ];
 
  const getRandomElement = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };
 
  const roles = [...new Set(people.map(p => p.role))];
  const firstNames = [...new Set(people.map(p => p.first))];
  const lastNames = [...new Set(people.map(p => p.last))];
 
  const mockEntities: Entity[] = Array.from({ length: 2000 }).map((_, i) => ({
    id: (i + 1).toString(),
    name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
    role: getRandomElement(roles),
  }));
 
  return {
    entities: mockEntities,
    json: JSON.stringify(mockEntities, null, 2),
  };
}
 