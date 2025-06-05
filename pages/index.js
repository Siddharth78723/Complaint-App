
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectItem } from "../components/ui/select";
import Image from "next/image";
import * as XLSX from "xlsx";
import logo from "../assets/Amity_Uni_Rajasthan_Logo.jpg";

const complaintsDB = [];

const roles = {
  USER: "user",
  SUPERVISOR: "supervisor",
  TECHNICIAN: "technician",
};

export default function ComplaintApp() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem("session")) || null);
  const [role, setRole] = useState(session?.role || roles.USER);
  const [name, setName] = useState(session?.name || "");
  const [email, setEmail] = useState(session?.email || "");
  const [contact, setContact] = useState(session?.contact || "");
  const [password, setPassword] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    name: "",
    contact: "",
    type: "",
    description: "",
    preferredTime: "",
  });

  const login = () => {
    const newSession = { name, role, email, contact };
    localStorage.setItem("session", JSON.stringify(newSession));
    setSession(newSession);
  };

  const logout = () => {
    localStorage.removeItem("session");
    setSession(null);
  };

  const sendEmailNotification = async (subject, message, to) => {
    console.log("Pretend to send email", subject, message, to);
  };

  const submitComplaint = () => {
    const newComplaint = {
      ...form,
      id: Date.now(),
      status: "Pending",
      assignedTo: "",
      createdAt: new Date(),
    };
    complaintsDB.push(newComplaint);
    setComplaints([...complaintsDB]);
    sendEmailNotification("New Complaint Registered", `Type: ${form.type}\nName: ${form.name}\nContact: ${form.contact}`, session.email);
    setForm({ name: "", contact: "", type: "", description: "", preferredTime: "" });
  };

  const assignComplaint = (id, technicianMobile) => {
    const index = complaintsDB.findIndex(c => c.id === id);
    if (index !== -1) {
      complaintsDB[index].assignedTo = technicianMobile;
      complaintsDB[index].status = "Assigned";
      setComplaints([...complaintsDB]);
    }
  };

  const markResolved = (id) => {
    const index = complaintsDB.findIndex(c => c.id === id);
    if (index !== -1) {
      complaintsDB[index].status = "Resolved";
      setComplaints([...complaintsDB]);
      const comp = complaintsDB[index];
      sendEmailNotification("Complaint Resolved", `Complaint ID: ${comp.id} has been resolved.`, session.email);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(complaints);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Complaints");
    XLSX.writeFile(wb, "complaints.xlsx");
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const pending = complaintsDB.filter(c => c.status !== "Resolved");
      if (pending.length && role === roles.SUPERVISOR) {
        alert("Reminder: There are unresolved complaints!");
        sendEmailNotification("Reminder: Unresolved Complaints", `${pending.length} complaints are still pending.`, session.email);
      }
    }, 7200000);
    return () => clearInterval(timer);
  }, [role]);

  const filteredComplaints = complaints.filter(c => filter === "All" ? true : filter === "Resolved" ? c.status === "Resolved" : c.status !== "Resolved");

  if (!session) {
    return (
      <div className="p-4 max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Register / Login</h1>
        <Input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Email or Mobile" value={role === roles.TECHNICIAN ? contact : email} onChange={e => role === roles.TECHNICIAN ? setContact(e.target.value) : setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <Select value={role} onValueChange={setRole}>
          <SelectItem value={roles.USER}>End User</SelectItem>
          <SelectItem value={roles.SUPERVISOR}>Supervisor</SelectItem>
          <SelectItem value={roles.TECHNICIAN}>Technician</SelectItem>
        </Select>
        <Button onClick={login}>Login</Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Image src={logo} alt="Amity Logo" width={180} height={60} />
          <h1 className="text-xl font-bold">Technical Complaint Management</h1>
        </div>
        <Button onClick={logout}>Logout</Button>
      </div>

      {role === roles.USER && (
        <Card>
          <CardContent className="space-y-2 pt-4">
            <Input placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Contact Number" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
            <Select value={form.type} onValueChange={value => setForm({ ...form, type: value })}>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Plumbing">Plumbing</SelectItem>
              <SelectItem value="Civil">Civil</SelectItem>
              <SelectItem value="Carpentry">Carpentry</SelectItem>
            </Select>
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="Preferred Time" value={form.preferredTime} onChange={e => setForm({ ...form, preferredTime: e.target.value })} />
            <Button onClick={submitComplaint}>Submit Complaint</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <label className="font-semibold">Filter:</label>
        <Select value={filter} onValueChange={setFilter}>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Resolved">Resolved</SelectItem>
        </Select>
        <Button onClick={exportToExcel}>Export to Excel</Button>
      </div>

      <div className="space-y-2">
        {filteredComplaints.map(c => (
          <Card key={c.id} className="border-l-4" style={{ borderColor: c.status === "Resolved" ? "green" : c.status === "Assigned" ? "orange" : "red" }}>
            <CardContent className="pt-4">
              <div><b>ID:</b> {c.id}</div>
              <div><b>Name:</b> {c.name}</div>
              <div><b>Type:</b> {c.type}</div>
              <div><b>Status:</b> {c.status}</div>
              <div><b>Assigned To:</b> {c.assignedTo || "Not Assigned"}</div>
              <div><b>Description:</b> {c.description}</div>
              <div><b>Preferred Time:</b> {c.preferredTime}</div>
              {role === roles.SUPERVISOR && c.status === "Pending" && (
                <Input placeholder="Technician Mobile" onBlur={e => assignComplaint(c.id, e.target.value)} />
              )}
              {role === roles.TECHNICIAN && c.status === "Assigned" && (
                <Button onClick={() => markResolved(c.id)}>Mark as Resolved</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
