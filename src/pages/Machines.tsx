import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { machineService } from "../Services/machineService";
import { labService } from "../Services/labService";
import { Machine } from "../Models/Machine";

export default function Machines() {

  const [machines, setMachines] = useState<Machine[]>([]);
  const [labs, setLabs] = useState<any[]>([]);

  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");

  /* ================= FORM ADD ================= */
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    labId: "",
  });

  /* ================= FORM EDIT ================= */
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    labId: "",
    status: "",
  });

  /* ================= LOAD ================= */
  useEffect(() => {
    loadMachines();
    loadLabs();
  }, []);

  const loadMachines = async () => {
    const data = await machineService.getAll();
    setMachines(data);
  };

  const loadLabs = async () => {
    const data = await labService.getAll();
    setLabs(data);
  };

  /* ================= FILTER ================= */
  const filteredMachines = machines.filter((m) =>
    (statusFilter === "Tous" || m.status === statusFilter) &&
    (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase())
    )
  );

  /* ================= STATUS ================= */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPERATIONNELLE": return "bg-green-100 text-green-700";
      case "EN_PANNE": return "bg-red-100 text-red-700";
      case "RESOLUE": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPERATIONNELLE": return "Opérationnelle";
      case "EN_PANNE": return "En panne";
      case "RESOLUE": return "Réparée";
      default: return "Inconnu";
    }
  };

  const getLabName = (labId?: string) => {
    if (!labId) return "Inconnu";
    return labs.find((l) => l.id === labId)?.name || "Inconnu";
  };

  /* ================= ADD ================= */
  const addMachine = async () => {
    try {
      if (!formData.name || !formData.labId) {
        alert("Remplir tous les champs");
        return;
      }

      const newMachine = {
        name: formData.name,
        description: formData.description,
        labId: formData.labId,
        status: "OPERATIONNELLE",
        Dernier_entretien: null,
      };

      await machineService.create(newMachine);
      await loadMachines();

      setFormData({ name: "", description: "", labId: "" });
      setOpenModal(false);

    } catch (err) {
      console.error(err);
    }
  };

  /* ================= OPEN EDIT ================= */
  const openEditModal = (machine: Machine) => {
    setSelectedMachine(machine);

    setEditData({
      name: machine.name,
      description: machine.description || "",
      labId: machine.labId || "",
      status: machine.status || "OPERATIONNELLE",
    });

    setOpenEdit(true);
  };

  /* ================= UPDATE ================= */
  const updateMachine = async () => {
    if (!selectedMachine) return;

    let entretien = selectedMachine.Dernier_entretien;

    if (editData.status === "RESOLUE") {
      entretien = new Date().toISOString();
    }

    if (editData.status === "EN_PANNE") {
      entretien = null;
    }

    await machineService.update(selectedMachine.id, {
      name: editData.name,
      description: editData.description,
      labId: editData.labId,
      status: editData.status,
      Dernier_entretien: entretien,
    });

    await loadMachines();
    setOpenEdit(false);
  };

  /* ================= DELETE ================= */
  const deleteMachine = async (id: string) => {
    await machineService.delete(id);
    await loadMachines();
  };

  /* ================= UI ================= */
  return (
    <div>

      <PageMeta title="Machines" description="Gestion machines" />
      <PageBreadcrumb pageTitle="Machines" />

      <div className="p-6 bg-white rounded-xl">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Machines</h1>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Ajouter
          </button>
        </div>

        {/* FILTER */}
        <div className="flex gap-4 mb-6">
          <input
            className="border p-2 w-1/2"
            placeholder="Recherche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Tous">Tous</option>
            <option value="OPERATIONNELLE">Opérationnelle</option>
            <option value="EN_PANNE">En panne</option>
            <option value="RESOLUE">Réparée</option>
          </select>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-3 gap-6">

          {filteredMachines.map((m) => (
            <div key={m.id} className="border p-4 rounded">

              <span className={`px-2 py-1 text-sm rounded ${getStatusColor(m.status)}`}>
                {getStatusLabel(m.status)}
              </span>

              <h2 className="font-bold mt-2">{m.name}</h2>
              <p className="text-gray-500">{m.description}</p>

              <p className="text-xs text-gray-400">
                Labo : {getLabName(m.labId)}
              </p>

              <p className="text-xs mt-2">
                Dernier entretien : {
                  m.Dernier_entretien
                    ? new Date(m.Dernier_entretien).toLocaleDateString()
                    : "Pas encore"
                }
              </p>

              <div className="flex gap-2 mt-3">

                <button
                  onClick={() => openEditModal(m)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Modifier
                </button>

                <button
                  onClick={() => deleteMachine(m.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Supprimer
                </button>

              </div>
            </div>
          ))}

        </div>

        {/* ================= ADD MODAL ================= */}
        {openModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white p-6 w-[400px] rounded relative">

              <button onClick={() => setOpenModal(false)} className="absolute top-2 right-3">
                ✖
              </button>

              <h2 className="mb-4">Ajouter Machine</h2>

              <input
                className="border p-2 w-full mb-3"
                placeholder="Nom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <input
                className="border p-2 w-full mb-3"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <select
                className="border p-2 w-full mb-3"
                value={formData.labId}
                onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
              >
                <option value="">Choisir labo</option>
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>

              <button
                onClick={addMachine}
                className="bg-green-600 text-white w-full p-2"
              >
                Ajouter
              </button>

            </div>
          </div>
        )}

        {/* ================= EDIT MODAL ================= */}
        {openEdit && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white p-6 w-[400px] rounded relative">

              <button onClick={() => setOpenEdit(false)} className="absolute top-2 right-3">
                ✖
              </button>

              <h2 className="mb-4">Modifier Machine</h2>

              <input
                className="border p-2 w-full mb-3"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />

              <input
                className="border p-2 w-full mb-3"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />

              <select
                className="border p-2 w-full mb-3"
                value={editData.labId}
                onChange={(e) => setEditData({ ...editData, labId: e.target.value })}
              >
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>

              <select
                className="border p-2 w-full mb-3"
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              >
                <option value="OPERATIONNELLE">Opérationnelle</option>
                <option value="EN_PANNE">En panne</option>
                <option value="RESOLUE">Réparée</option>
              </select>

              <button
                onClick={updateMachine}
                className="bg-blue-600 text-white w-full p-2"
              >
                Enregistrer
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}