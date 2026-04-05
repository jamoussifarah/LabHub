import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Machines() {

const [selectedMachine, setSelectedMachine] = useState<any>(null);
const [openModal, setOpenModal] = useState<boolean>(false);

  const [machines, setMachines] = useState([
    {
      id: "PC-A101",
      nom: "Ordinateur Dell Optiplex",
      type: "PC",
      labo: "Labo Info 1",
      entretien: "2026-01-15",
      status: "En panne",
    },
    {
      id: "OSC-B205",
      nom: "Oscilloscope Tektronix",
      type: "Oscilloscope",
      labo: "Labo Électronique",
      entretien: "2026-02-10",
      status: "Opérationnel",
    },
    {
      id: "IMP3D-A103",
      nom: "Imprimante 3D Prusa",
      type: "Imprimante 3D",
      labo: "Labo Info 2",
      entretien: "2026-02-20",
      status: "Maintenance",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [laboFilter, setLaboFilter] = useState("Tous");

  const filteredMachines = machines.filter((m) => {
    return (
      (statusFilter === "Tous" || m.status === statusFilter) &&
      (laboFilter === "Tous" || m.labo === laboFilter) &&
      (m.nom.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase()))
    );
  });

const deleteMachine = (id: string) => {
  setMachines(machines.filter((m) => m.id !== id));
};

const addMachine = () => {
  const newMachine = {
    id: "PC-" + Math.floor(Math.random() * 1000),
    nom: "Nouvelle machine",
    type: "PC",
    labo: "Labo Info 1",
    entretien: "2026-03-20",
    status: "Opérationnel",
  };

  setMachines([...machines, newMachine]);
};

const editMachine = (id: string) => {
  setMachines(
    machines.map((m) =>
      m.id === id ? { ...m, status: "Maintenance" } : m
    )
  );
};

  return (
    <div>
      <PageMeta title="Gestion des machines" description="Dashboard machines" />
      <PageBreadcrumb pageTitle="Gestion des machines" />

      <div className="p-6 bg-white rounded-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des machines</h1>

          <button
  onClick={addMachine}
  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
>
  + Ajouter une machine
</button>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-100 rounded-lg">
            <p>Opérationnelles</p>
            <h2 className="text-xl font-bold">5</h2>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <p>En maintenance</p>
            <h2 className="text-xl font-bold">2</h2>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg">
            <p>En panne</p>
            <h2 className="text-xl font-bold">1</h2>
          </div>
        </div>

        {/* FILTRES */}
        <div className="flex gap-4 mb-6">

          <input
            type="text"
            placeholder="Rechercher par ID, nom ou type..."
            className="border p-2 rounded w-1/2"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Tous</option>
            <option>Opérationnel</option>
            <option>Maintenance</option>
            <option>En panne</option>
          </select>

          <select
            className="border p-2 rounded"
            onChange={(e) => setLaboFilter(e.target.value)}
          >
            <option>Tous</option>
            <option>Labo Info 1</option>
            <option>Labo Info 2</option>
            <option>Labo Électronique</option>
          </select>

        </div>

        {/* CARTES MACHINES */}
        <div className="grid grid-cols-3 gap-6">
          {filteredMachines.map((machine) => (
            <div
              key={machine.id}
              onClick={() => {
        setSelectedMachine(machine);
        setOpenModal(true);
      }}
              className="border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between">
                <h3 className="text-blue-600 font-semibold">
                  {machine.id}
                </h3>

                <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                  {machine.status}
                </span>
              </div>

              <p className="mt-2">{machine.nom}</p>

              <div className="text-sm text-gray-500 mt-3">
                <p>Type : {machine.type}</p>
                <p>Laboratoire : {machine.labo}</p>
                <p>Dernier entretien : {machine.entretien}</p>
              </div>

              <div className="flex gap-2 mt-4">
               <button
  onClick={(e) => {
    e.stopPropagation();
    editMachine(machine.id);
  }}
  className="bg-blue-500 text-white px-3 py-1 rounded"
>
  Modifier
</button>

                <button
  onClick={(e) => {
    e.stopPropagation();
    deleteMachine(machine.id);
  }}
  className="bg-red-500 text-white px-3 py-1 rounded"
>
  Supprimer
</button>
              </div>
            </div>
          ))}
        </div>



        {/* Fenêtre Détails Machine */}
        {openModal && selectedMachine && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

            <div className="bg-white w-[450px] rounded-xl shadow-lg p-6 relative">

              <button
                onClick={() => setOpenModal(false)}
                className="absolute top-3 right-3 text-gray-500"
              >
                ✖
              </button>

              <h2 className="text-lg font-semibold mb-4">
                Détails de la machine
              </h2>

              <p className="text-blue-600 font-medium mb-4">
                {selectedMachine.id}
              </p>

              <p><b>Nom :</b> {selectedMachine.nom}</p>
              <p><b>Type :</b> {selectedMachine.type}</p>
              <p><b>Laboratoire :</b> {selectedMachine.labo}</p>
              <p><b>Statut :</b> {selectedMachine.status}</p>
              <p><b>Dernier entretien :</b> {selectedMachine.entretien}</p>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
