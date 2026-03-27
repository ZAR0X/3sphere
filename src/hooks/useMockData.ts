export interface Entity {
  id: string;
  name: string;
  role: string;
}

export function useMockData() {
  const roles = [
    "Frontend Developer", "Backend Developer", "UI/UX Designer", 
    "Data Scientist", "Project Manager", "DevOps Engineer", 
    "QA Tester", "Cloud Architect", "Security Analyst", "Product Owner"
  ];
  const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

  // Generate deterministic 100 mock entities
  const mockEntities: Entity[] = Array.from({ length: 100 }).map((_, i) => ({
    id: (i + 1).toString(),
    name: `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`,
    role: roles[i % roles.length]
  }));

  return { 
    entities: mockEntities, 
    json: JSON.stringify(mockEntities, null, 2)
  };
}

// [
//     { id: "1", name: "Alice Johnson", role: "Frontend Developer" },
//     { id: "2", name: "Bob Smith", role: "UI/UX Designer" },
//     { id: "3", name: "Charlie Davis", role: "Data Scientist" },
//     { id: "4", name: "Diana Lopez", role: "Project Manager" },
//     { id: "5", name: "Evan Wright", role: "Backend Engineer" },
//     { id: "6", name: "Fiona Gallagher", role: "QA Tester" },
//     { id: "7", name: "George Mason", role: "Marketing Lead" },
//     { id: "8", name: "Hannah Abbott", role: "Support Specialist" },
//     { id: "9", name: "Ian Chen", role: "DevOps Engineer" },
//     { id: "10", name: "Julia Roberts", role: "Product Owner" },
//     { id: "11", name: "Kevin Hart", role: "Content Writer" },
//     { id: "12", name: "Linda Evans", role: "HR Manager" },
//     { id: "13", name: "Michael Scott", role: "Regional Manager" },
//     { id: "14", name: "Nina Dobrev", role: "Lead Designer" },
//     { id: "15", name: "Oscar Diaz", role: "Security Analyst" },
//     { id: "16", name: "Paul Atreides", role: "Cloud Architect" },
//     { id: "17", name: "Quinn Fabray", role: "Social Media Manager" },
//     { id: "18", name: "Rachel Green", role: "Sales Executive" },
//     { id: "19", name: "Sam Winchester", role: "Operations Director" },
//     { id: "20", name: "Tina Cohen", role: "Customer Success" },
//     { id: "21", name: "Uma Thurman", role: "Full Stack Engineer" },
//     { id: "22", name: "Victor Stone", role: "Hardware Engineer" },
//     { id: "23", name: "Wendy Wu", role: "Mobile Developer" },
//     { id: "24", name: "Xavier Woods", role: "DB Administrator" },
//     { id: "25", name: "Yara Shahidi", role: "QA Engineer" },
//     { id: "26", name: "Zachary Levi", role: "IT Support" },
//     { id: "27", name: "Alyssa Milano", role: "Business Analyst" },
//     { id: "28", name: "Brian O'Conner", role: "Logistics Coordinator" },
//     { id: "29", name: "Chloe Decker", role: "Legal Advisor" },
//     { id: "30", name: "David Rose", role: "Creative Director" }
//   ]
