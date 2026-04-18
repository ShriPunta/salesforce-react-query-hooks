import { useState } from "react";
import { useDescribeQuery } from "../hooks/useDescribeQuery";

export function DescribeViewer() {
  const [input, setInput] = useState("Account");
  const [sobjectName, setSobjectName] = useState("Account");

  const q = useDescribeQuery(sobjectName);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Describe SObject</h2>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border border-gray-300 p-2 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Account"
        />
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => setSobjectName(input)}
        >
          Describe
        </button>
      </div>

      {q.isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {q.isError && (
        <p className="text-sm text-red-600">Error: {q.error.message}</p>
      )}
      {q.data && (
        <div className="space-y-2">
          <h3 className="font-medium">
            {q.data.label} ({q.data.name}) — {q.data.fields.length} fields
          </h3>
          <div className="max-h-96 overflow-auto rounded border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">Label</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Updateable</th>
                </tr>
              </thead>
              <tbody>
                {q.data.fields.map((f) => (
                  <tr key={f.name} className="border-t">
                    <td className="p-2 font-mono text-xs">{f.name}</td>
                    <td className="p-2">{f.label}</td>
                    <td className="p-2 text-gray-600">{f.type}</td>
                    <td className="p-2">{f.updateable ? "yes" : "no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
