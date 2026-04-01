export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-gray-600">ページが見つかりません</p>
      <a
        href="/"
        className="mt-4 text-sm text-blue-600 hover:underline"
      >
        トップに戻る
      </a>
    </div>
  );
}
