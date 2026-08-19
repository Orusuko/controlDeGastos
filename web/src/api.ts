export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

export interface Summary {
  total: number;
  byCategory: { category: string; total: number; count: number }[];
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  listExpenses: () => fetch("/api/expenses").then((r) => handle<Expense[]>(r)),
  getCategories: () => fetch("/api/categories").then((r) => handle<string[]>(r)),
  getSummary: () => fetch("/api/summary").then((r) => handle<Summary>(r)),
  createExpense: (payload: {
    description: string;
    amount: number;
    category: string;
    date: string;
  }) =>
    fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => handle<Expense>(r)),
  deleteExpense: (id: number) =>
    fetch(`/api/expenses/${id}`, { method: "DELETE" }).then((r) =>
      handle<void>(r)
    ),
};
