/* eslint-disable no-unused-vars */
import { useEffect, useState, useContext } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { ThemeContext } from "../App";
import { db } from "../firebase/firebase";
import ModalForm from "../components/ModalForm";
import UpdateStudentModal from "../components/UpdateStudentModal";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DataTable from 'react-data-table-component';


const Student = () => {
  const { theme } = useContext(ThemeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const studentsCollection = collection(db, "student");
      const studentsSnapshot = await getDocs(studentsCollection);
      const studentsData = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsData);
    };

    fetchStudents();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "student", id));
      setStudents(students.filter((student) => student.id !== id));
    } catch (error) {
      console.error("Error deleting student: ", error);
    }
  };

  const handleAddStudent = async (formData) => {
    try {
      const newStudentRef = await addDoc(collection(db, "student"), formData);
      const newStudent = { id: newStudentRef.id, ...formData };
      setStudents([...students, newStudent]);
      toast.success("Student added successfully!");
    } catch (error) {
      console.error("Error adding student: ", error);
      toast.error("Error adding student. Please try again.");
    }
  };

  const handleUpdate = async (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleUpdateConfirm = async (updatedStudent) => {
    try {
      if (updatedStudent.id) {
        const studentRef = doc(db, "student", updatedStudent.id);
        await updateDoc(studentRef, {
          firstName: updatedStudent.firstName,
          lastName: updatedStudent.lastName,
          department: updatedStudent.department,
          emailAddress: updatedStudent.emailAddress,
          indexNumber: updatedStudent.indexNumber,
        });
        toast.success("Student updated successfully!");
        setStudents(
          students.map((student) =>
            student.id === updatedStudent.id ? updatedStudent : student
          )
        );
        setShowModal(false);
      } else {
        console.error("Invalid student ID");
        toast.error("Error updating student. Please try again.");
      }
    } catch (error) {
      console.error("Error updating student: ", error);
      toast.error("Error updating student. Please try again.");
    }
  };

  const columns = [
    {
      name: 'First Name',
      selector: row => row.firstName,
      sortable: true,
    },
    {
      name: 'Last Name',
      selector: row => row.lastName,
      sortable: true,
    },
    {
      name: 'Department',
      selector: row => row.department,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.emailAddress,
      sortable: true,
    },
    {
      name: 'Index Number',
      selector: row => row.indexNumber,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <button
          className="buttonStyle px-3"
          onClick={() => handleUpdate(row)}
        >
          Update
        </button>
      ),
    },
  ];

  return (
    <div
      className={`${
        theme === "dark" ? "dark" : "light"
      } flex justify-center items-center flex-col  h-[100vh] w-[100vw] mt-10 darkmode sm:scale-100 scale-[90%]`}
    >
      <div><h1>Registered Students</h1></div>
      
      <div>
        {showModal && (
          <UpdateStudentModal
            onSubmit={handleUpdateConfirm}
            onClose={() => setShowModal(false)}
            theme={theme}
            student={editingStudent}
          />
        )}
      </div>
      
      <div className="flex flex-col items-center justify-end scale-[80%] dark:bg-black  gap-2 darkmode">
       
        
      <DataTable
    
        columns={columns}
        data={students}
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 20, 30]}
        sortable
      />
        <div className="flex justify-center mt-11">
          <button onClick={openModal} className="buttonStyle p-4  ">
            Register Student
          </button>
        </div>
      </div>

      

      {isModalOpen && (
        <ModalForm
          onSubmit={handleAddStudent}
          onClose={closeModal}
          theme={theme}
        />
      )}
    </div>
  );
};

export default Student;
