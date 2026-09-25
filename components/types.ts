export interface Book {
  id: string;
  author: string;
  title: string;
  subTitle: string;
  imageLink: string;
  audioLink: string;
  averageRating: number;
  keyIdeas: number;
  type: string;
  status: "selected" | "recommended" | "suggested";
  summary: string;
  tags: string[];
}
