import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { labService } from "../Services/labService";
import { Lab } from "../Models/Lab";


type CreateLabForm = {
  name: string;
  description?: string;
  location?: string;
  capacity: number;
};

export default function Laboratoires() {
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");

  const [labs, setLabs] = useState<Lab[]>([]);

  /* FORM */
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    capacity: 0,
    availableSpots: 0,
    available: true,
  });

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

  /* HANDLE CHANGE */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  /* OPEN ADD */
  const openAddModal = () => {
    setSelectedLab(null);

    setFormData({
      name: "",
      description: "",
      location: "",
      capacity: 0,
      availableSpots: 0,
      available: true,
    });

    setOpenModal(true);
  };

  /* OPEN EDIT */
  const openEditModal = (lab: Lab) => {
    setSelectedLab(lab);

    setFormData({
      name: lab.name,
      description: lab.description || "",
      location: lab.location || "",
      capacity: lab.capacity,
      availableSpots: lab.availableSpots,
      available: lab.available,
    });

    setOpenModal(true);
  };

  /* ===================== */
  /* ADD LAB (FIX IMPORTANT) */
  /* ===================== */
  const addLab = async () => {
  try {
    const payload = {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      capacity: formData.capacity,
      availableSpots: formData.capacity,
      available: true,
    };

    await labService.create(payload as any);

    setOpenModal(false);
    await loadLabs();
  } catch (error) {
    console.error("Erreur ajout lab", error);
  }
};
  /* ===================== */
  /* EDIT LAB */
  /* ===================== */
  const editLab = async () => {
    if (!selectedLab) return;

    try {
      await labService.update(selectedLab.id, {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        capacity: formData.capacity,
        availableSpots: formData.availableSpots,
        available: formData.available,
      });

      setOpenModal(false);
      await loadLabs();
    } catch (error) {
      console.error("Erreur update lab", error);
    }
  };

  /* DELETE */
  const deleteLab = async (id: string) => {
    try {
      await labService.delete(id);
      setLabs(labs.filter((l) => l.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  /* FILTER */
  const filteredLabs = labs.filter((lab) => {
    return (
      (statusFilter === "Tous" ||
        (statusFilter === "Disponible"
          ? lab.available
          : !lab.available)) &&
      (lab.name.toLowerCase().includes(search.toLowerCase()) ||
        lab.id.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const getStatusColor = (available: boolean) =>
    available
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  const getStatusLabel = (available: boolean) =>
    available ? "Disponible" : "Occupé";

  return (
    <div>
      <PageMeta title="Gestion des laboratoires" description="" />
      <PageBreadcrumb pageTitle="Laboratoires" />

      <div className="p-6 bg-white rounded-xl">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Gestion des laboratoires
          </h1>

          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Ajouter
          </button>
        </div>

        {/* FILTER */}
        <div className="flex gap-4 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
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

        {/* LIST */}
        <div className="grid grid-cols-3 gap-6">
          {filteredLabs.map((lab) => (
            <div
              key={lab.id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <span
                className={`text-sm px-2 py-1 rounded ${getStatusColor(
                  lab.available
                )}`}
              >
                {getStatusLabel(lab.available)}
              </span>

              <p className="mt-2 font-medium">{lab.name}</p>

              <div className="text-sm text-gray-500 mt-3">
                <p>{lab.description}</p>
                <p>Capacité : {lab.capacity}</p>
                <p>Places : {lab.availableSpots}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(lab)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Modifier
                </button>

                <button
                  onClick={() => deleteLab(lab.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
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
                {selectedLab
                  ? "Modifier laboratoire"
                  : "Ajouter laboratoire"}
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
                placeholder="Location"
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

              {/* EDIT ONLY */}
              {selectedLab && (
                <>
                  <input
                    name="availableSpots"
                    type="number"
                    value={formData.availableSpots}
                    onChange={handleChange}
                    placeholder="Places disponibles"
                    className="border p-2 w-full mb-3"
                  />

                  <div className="flex items-center justify-between mb-3">
                    <span>Disponible</span>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          available: !formData.available,
                        })
                      }
                      className={`px-3 py-1 rounded ${
                        formData.available
                          ? "bg-green-500"
                          : "bg-red-500"
                      } text-white`}
                    >
                      {formData.available ? "✔ Oui" : "❌ Non"}
                    </button>
                  </div>
                </>
              )}

              <button
                onClick={selectedLab ? editLab : addLab}
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                {selectedLab ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}