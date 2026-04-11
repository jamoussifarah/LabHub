import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserInfoCard() {
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
          Personal Information
        </h4>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <p className="text-xs text-gray-500">Name</p>
            <p className="text-sm font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Role</p>
            <p className="text-sm font-medium">{user.role}</p>
          </div>

        </div>

        <button
          onClick={openModal}
          className="mt-5 px-4 py-2 border rounded-full"
        >
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md m-4">
          <div className="relative w-full bg-white rounded-2xl p-5 max-h-[80vh] overflow-y-auto">

          <h2 className="text-xl font-semibold mb-4">
            Edit Info
          </h2>

          <Label>Name</Label>
          <Input
            value={user.name || ""}
            onChange={(e) =>
              setUser({ ...user, name: e.target.value })
            }
          />

          <Label>Email</Label>
          <Input
            value={user.email || ""}
            onChange={(e) =>
              setUser({ ...user, email: e.target.value })
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