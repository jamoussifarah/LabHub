import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { labService } from "../Services/labService";

type Lab = {
  id: string;
  name: string;
  description?: string;
  location?: string;
  capacity: number;
  available: boolean;
  availableSpots: number;
  machines: any[];
};

export default function Laboratoires() {

  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");

  // 🔥 FORM
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    capacity: 0,
  });

  /* ===================== */
  /* LOAD */
  /* ===================== */

  useEffect(() => {
    loadLabs();
  }, []);

  const loadLabs = async () => {
    try {
      const data = await labService.getAll();
      setLabs(data);
    } catch (error) {
      console.error("Erreur chargement labs", error);
    }
  };

  /* ===================== */
  /* FILTER */
  /* ===================== */

  const filteredLabs = labs.filter((lab) => {
    return (
      (statusFilter === "Tous" ||
        (statusFilter === "Disponible"
          ? lab.available
          : !lab.available)) &&
      (
        lab.name.toLowerCase().includes(search.toLowerCase()) ||
        lab.id.toLowerCase().includes(search.toLowerCase())
      )
    );
  });

  /* ===================== */
  /* FORM HANDLER */
  /* ===================== */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "capacity"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  /* ===================== */
  /* OPEN MODAL */
  /* ===================== */

  const openAddModal = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      capacity: 0,
    });

    setOpenModal(true);
  };

  /* ===================== */
  /* ADD LAB */
  /* ===================== */

  const addLab = async () => {
    try {
      const newLab = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        capacity: formData.capacity,
        available: true,
        availableSpots: formData.capacity,
        machines: [],
      };

      await labService.create(newLab);
      await loadLabs();

      setOpenModal(false);

    } catch (error) {
      console.error("Erreur ajout lab", error);
    }
  };

  /* ===================== */
  /* DELETE */
  /* ===================== */

  const deleteLab = (id: string) => {
    setLabs(labs.filter((l) => l.id !== id));
  };

  /* ===================== */
  /* STATUS UI */
  /* ===================== */

  const getStatusColor = (available: boolean) =>
    available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

  const getStatusLabel = (available: boolean) =>
    available ? "Disponible" : "Occupé";

  return (
    <div>

      <PageMeta
        title="Gestion des laboratoires"
        description="Dashboard laboratoires"
      />

      <PageBreadcrumb pageTitle="Gestion des laboratoires" />

      <div className="p-6 bg-white rounded-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-bold">
            Gestion des laboratoires
          </h1>

          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Ajouter un laboratoire
          </button>

        </div>

        {/* FILTRES */}
        <div className="flex gap-4 mb-6">

          <input
            type="text"
            placeholder="Rechercher laboratoire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-1/2"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="Tous">Tous</option>
            <option value="Disponible">Disponible</option>
            <option value="Occupé">Occupé</option>
          </select>

        </div>

        <p className="text-sm text-gray-500 mb-4">
          {filteredLabs.length} laboratoires trouvés
        </p>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-6">

          {filteredLabs.map((lab) => (

            <div
              key={lab.id}
              onClick={() => {
                setSelectedLab(lab);
                setOpenDetails(true);
              }}
              className="border rounded-lg p-4 shadow-sm cursor-pointer"
            >

              <span className={`text-sm px-2 py-1 rounded ${getStatusColor(lab.available)}`}>
                {getStatusLabel(lab.available)}
              </span>

              <p className="mt-2 font-medium">{lab.name}</p>

              <div className="text-sm text-gray-500 mt-3">
                <p>Capacité : {lab.capacity}</p>
                <p>Places dispo : {lab.availableSpots}</p>
                <p>Machines : {lab.machines?.length ?? 0}</p>
              </div>

              <div className="flex gap-2 mt-4">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Modifier
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLab(lab.id);
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Supprimer
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* ===================== */}
        {/* ADD MODAL (IMPORTANT) */}
        {/* ===================== */}

        {openModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

            <div className="bg-white w-[450px] rounded-xl shadow-lg p-6 relative">

              <button
                onClick={() => setOpenModal(false)}
                className="absolute top-3 right-3"
              >
                ✖
              </button>

              <h2 className="text-lg font-semibold mb-4">
                Ajouter un laboratoire
              </h2>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nom"
                className="border p-2 w-full mb-3"
              />

              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="border p-2 w-full mb-3"
              />

              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Localisation"
                className="border p-2 w-full mb-3"
              />

              <input
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Capacité"
                className="border p-2 w-full mb-3"
              />

              <button
                onClick={addLab}
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                Ajouter
              </button>

            </div>

          </div>
        )}

        {/* ===================== */}
        {/* DETAILS MODAL */}
        {/* ===================== */}

        {openDetails && selectedLab && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

            <div className="bg-white w-[450px] rounded-xl shadow-lg p-6 relative">

              <button
                onClick={() => setOpenDetails(false)}
                className="absolute top-3 right-3"
              >
                ✖
              </button>

              <h2 className="text-lg font-semibold mb-4">
                Détails laboratoire
              </h2>

              <p><b>Nom :</b> {selectedLab.name}</p>
              <p><b>Capacité :</b> {selectedLab.capacity}</p>
              <p><b>Places dispo :</b> {selectedLab.availableSpots}</p>
              <p><b>Statut :</b> {selectedLab.available ? "Disponible" : "Occupé"}</p>

              <p className="mt-3"><b>Machines :</b></p>

              <ul className="list-disc ml-5 text-sm text-gray-600">
                {selectedLab.machines?.map((m: any) => (
                  <li key={m.id}>{m.name}</li>
                ))}
              </ul>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}