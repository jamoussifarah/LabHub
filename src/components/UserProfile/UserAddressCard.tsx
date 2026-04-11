import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("reclamation_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleSave = () => {
    localStorage.setItem("reclamation_user", JSON.stringify(user));
    closeModal();
  };

  if (!user) return null;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl lg:p-6">

        <h4 className="text-lg font-semibold mb-5">
          Address
        </h4>

        <div className="grid grid-cols-2 gap-4">

          <p>Country: {user.country || "Tunisia"}</p>
          <p>City: {user.city || "Tunis"}</p>

        </div>

        <button
          onClick={openModal}
          className="mt-5 px-4 py-2 border rounded-full"
        >
          Edit
        </button>

      </div>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className="p-6">

          <h2 className="text-xl font-semibold mb-4">
            Edit Address
          </h2>

          <Label>Country</Label>
          <Input
            value={user.country || ""}
            onChange={(e) =>
              setUser({ ...user, country: e.target.value })
            }
          />

          <Label>City</Label>
          <Input
            value={user.city || ""}
            onChange={(e) =>
              setUser({ ...user, city: e.target.value })
            }
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>

            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>

        </div>
      </Modal>
    </>
  );
}