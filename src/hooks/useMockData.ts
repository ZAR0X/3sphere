export interface Entity {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  avatarUrl?: string;
}

export function useMockData() {
  const mockEntities: Entity[] = [
    {
      id: "1",
      name: "Alice Johnson",
      role: "Lead Developer",
      description: "Alice is an expert in 3D graphics and React. She built the core rendering engine for the sphere.",
      color: "#FF5733"
    },
    {
      id: "2",
      name: "Bob Smith",
      role: "UI/UX Designer",
      description: "Bob designed the beautiful interactions and color schemes that make this data visualization pop.",
      color: "#33FF57"
    },
    {
      id: "3",
      name: "Charlie Davis",
      role: "Data Scientist",
      description: "Charlie provided the mathematical models that dictate how particles connect and flow.",
      color: "#3357FF"
    },
    {
      id: "4",
      name: "Diana Lopez",
      role: "Project Manager",
      description: "Diana keeps the team on track and ensures all features are delivered on time.",
      color: "#F033FF"
    },
    {
      id: "5",
      name: "Evan Wright",
      role: "Backend Engineer",
      description: "Evan ensures our data pipelines are fast and reliable, feeding the frontend with real-time updates.",
      color: "#FFD133"
    },
    {
      id: "6",
      name: "Fiona Gallagher",
      role: "QA Tester",
      description: "Fiona rigorously tests every build, finding bugs before they ever reach our users.",
      color: "#33FFF5"
    },
    {
      id: "7",
      name: "George Mason",
      role: "Marketing Lead",
      description: "George crafts the narrative around our product and helps it reach a wider audience.",
      color: "#FF3333"
    },
    {
      id: "8",
      name: "Hannah Abbott",
      role: "Support Specialist",
      description: "Hannah helps our users get the most out of the visualization tool, answering questions night and day.",
      color: "#57FF33"
    }
  ];

  return { entities: mockEntities };
}
