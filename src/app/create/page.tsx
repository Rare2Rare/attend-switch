import { CreateThreadForm } from "@/components/thread-form";

export default function CreatePage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">新規スレッド作成</h1>
      <CreateThreadForm />
    </div>
  );
}
