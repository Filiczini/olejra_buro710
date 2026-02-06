export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  createdAt: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  image: File;
  tags: string[];
}
