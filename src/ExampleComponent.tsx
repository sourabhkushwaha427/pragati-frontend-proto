import React, { useEffect, useState } from "react";
import { api } from "./ApiService/ApiService";

interface Invoice {
  id: string;
  invoice_number: string;
  due_date: string;
  total_amount: number;
  status: string;
  party_name: string;
}

const ExampleComponent: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const token = localStorage.getItem("token") || "";

const fetchInvoices = async () => {
  console.log("🔹 Fetching invoices started..."); 
  try {
    const res = await api.get<Invoice[]>("/api/invoices", token);
    console.log("API Response:", res);

    const data = Array.isArray(res)
      ? res
      : Array.isArray(res.data)
      ? res.data
      : [];

    setInvoices(data);
  } catch (err) {
    console.error("Failed to fetch invoices:", err);
  }
};

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="p-4">
      <h2>Company Invoices</h2>
      <button onClick={fetchInvoices}>Refresh</button>

      {invoices.length > 0 ? (
        <ul>
          {invoices.map((inv) => (
            <li key={inv.id}>
              <strong>{inv.invoice_number}</strong> — {inv.party_name} — ₹
              {inv.total_amount} — {inv.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No invoices found.</p>
      )}
    </div>
  );
};

export default ExampleComponent;
