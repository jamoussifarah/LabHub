import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

type Lab = {
  id: string;
  nom: string;
  capacite: number;
  statut: string;
  responsable: string;
};

export default function Laboratoires() {

const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
const [openModal, setOpenModal] = useState(false);

const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("Tous");

const [labs, setLabs] = useState<Lab[]>([
{
id: "LAB-01",
nom: "Laboratoire Informatique 1",
capacite: 25,
statut: "Disponible",
responsable: "Dr Ahmed",
},
{
id: "LAB-02",
nom: "Laboratoire Électronique",
capacite: 20,
statut: "Occupé",
responsable: "Dr Sami",
},
{
id: "LAB-03",
nom: "Laboratoire Réseaux",
capacite: 30,
statut: "Maintenance",
responsable: "Dr Lina",
},
]);

/* FILTRAGE */

const filteredLabs = labs.filter((lab) => {
return (
(statusFilter === "Tous" || lab.statut === statusFilter) &&
(
lab.nom.toLowerCase().includes(search.toLowerCase()) ||
lab.id.toLowerCase().includes(search.toLowerCase()) ||
lab.responsable.toLowerCase().includes(search.toLowerCase())
)
);
});

/* ACTIONS */

const addLab = () => {

const newLab: Lab = {
id: "LAB-" + Math.floor(Math.random() * 1000),
nom: "Nouveau laboratoire",
capacite: 20,
statut: "Disponible",
responsable: "Non assigné",
};

setLabs([...labs, newLab]);
};

const deleteLab = (id: string) => {
setLabs(labs.filter((l) => l.id !== id));
};

const editLab = (id: string) => {
setLabs(
labs.map((l) =>
l.id === id ? { ...l, statut: "Maintenance" } : l
)
);
};

/* COULEURS STATUT */

const getStatusColor = (statut: string) => {

if (statut === "Disponible")
return "bg-green-100 text-green-700";

if (statut === "Occupé")
return "bg-red-100 text-red-700";

return "bg-yellow-100 text-yellow-700";

};

return (

<div>

<PageMeta title="Gestion des laboratoires" description="Dashboard laboratoires" />
<PageBreadcrumb pageTitle="Gestion des laboratoires" />

<div className="p-6 bg-white rounded-xl">

{/* HEADER */}

<div className="flex justify-between items-center mb-6">

<h1 className="text-2xl font-bold">
Gestion des laboratoires
</h1>

<button
onClick={addLab}
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
<option value="Maintenance">Maintenance</option>
</select>

</div>

<p className="text-sm text-gray-500 mb-4">
{filteredLabs.length} laboratoires trouvés
</p>

{/* CARTES */}

<div className="grid grid-cols-3 gap-6">

{filteredLabs.map((lab) => (

<div
key={lab.id}
onClick={()=>{
setSelectedLab(lab)
setOpenModal(true)
}}
className="border rounded-lg p-4 shadow-sm cursor-pointer"
>

<div className="flex justify-between">

<h3 className="text-blue-600 font-semibold">
{lab.id}
</h3>

<span
className={`text-sm px-2 py-1 rounded ${getStatusColor(lab.statut)}`}
>
{lab.statut}
</span>

</div>

<p className="mt-2 font-medium">
{lab.nom}
</p>

<div className="text-sm text-gray-500 mt-3">
<p>Capacité : {lab.capacite}</p>
<p>Responsable : {lab.responsable}</p>
</div>

<div className="flex gap-2 mt-4">

<button
onClick={(e)=>{
e.stopPropagation()
editLab(lab.id)
}}
className="bg-blue-500 text-white px-3 py-1 rounded"
>
Modifier
</button>

<button
onClick={(e)=>{
e.stopPropagation()
deleteLab(lab.id)
}}
className="bg-red-500 text-white px-3 py-1 rounded"
>
Supprimer
</button>

</div>

</div>

))}

</div>

{/* POPUP DETAILS */}

{openModal && selectedLab && (

<div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

<div className="bg-white w-[450px] rounded-xl shadow-lg p-6 relative">

<button
onClick={() => setOpenModal(false)}
className="absolute top-3 right-3 text-gray-500"
>
✖
</button>

<h2 className="text-lg font-semibold mb-4">
Détails du laboratoire
</h2>

<p className="text-blue-600 font-medium mb-4">
{selectedLab.id}
</p>

<p><b>Nom :</b> {selectedLab.nom}</p>
<p><b>Capacité :</b> {selectedLab.capacite}</p>
<p><b>Statut :</b> {selectedLab.statut}</p>
<p><b>Responsable :</b> {selectedLab.responsable}</p>

</div>

</div>

)}

</div>
</div>
);
}