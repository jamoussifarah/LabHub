import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserMetaCard() {
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
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">

            <div className="w-20 h-20 overflow-hidden border rounded-full">
              <img src="/images/user/owner.jpg" alt="user" />
            </div>

            <div>
              <h4 className="mb-2 text-lg font-semibold">
                {user.name}
              </h4>

              <p className="text-sm text-gray-500">
                {user.role}
              </p>

              <p className="text-sm text-gray-500">
                {user.email}
              </p>
            </div>

          </div>

          <button
            onClick={openModal}
            className="px-4 py-2 border rounded-full"
          >
            Edit
          </button>

        </div>
      </div>

      {/* MODAL (UI IDENTIQUE) */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-6 bg-white rounded-3xl">

          <h4 className="text-2xl font-semibold mb-4">
            Edit Profile
          </h4>

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