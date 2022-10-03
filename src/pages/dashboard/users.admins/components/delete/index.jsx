import React, { useState } from "react";
import ModalConfirm from "../../../../../components/modalConfirm";
import { Button } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import Api from "../../../../../utils/axios";
import SweetAlert from "../../../../../utils/sweetalert";

export default function DeleteRecord(props) {
  const { user, fetchData } = props;

  const [showModalConfirm, setShowModalConfirm] = useState(false);

  const handleDeleteRecord = async () => {
    try {
      setShowModalConfirm(false);
      await Api.delete(`persons/${user.person.id}`).catch((error) => {
        throw new Error(error.response.data);
      });
      SweetAlert.mixin({
        icon: "success",
        title: "Registro excluído com sucesso!",
      });
      fetchData();
    } catch (error) {
      if (error instanceof Error) {
        SweetAlert.mixin({ icon: "error", title: error.message });
      } else {
        SweetAlert.mixin({ icon: "error", title: "Erro ao excluir registro!" });
      }
    }
  };

  return (
    <>
      <ModalConfirm
        setShowModal={setShowModalConfirm}
        showModal={showModalConfirm}
        textConfirmation={`Confirma exclusão do usuário: ${user.person.name}`}
        handleConfirm={handleDeleteRecord}
      />
      <Button onClick={() => setShowModalConfirm(true)}>
        <BsTrash size={16} />
      </Button>
    </>
  );
}
