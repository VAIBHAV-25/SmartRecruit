import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const CandidateUpload = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 15;
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [candidateData, setCandidateData] = useState([]);
  const [candidateEmails, setCandidateEmails] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      // Ensure it's a valid Excel file
      if (
        selectedFile.type !==
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
        selectedFile.type !== "application/vnd.ms-excel"
      ) {
        setUploadStatus("Please upload a valid Excel file (.xlsx, .xls)");
        return;
      }

      setFile(selectedFile);
      setUploadStatus(`File selected: ${selectedFile.name}`);

      const reader = new FileReader();
      reader.onload = (e) => {
        // Read the file as binary data
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0]; // Assume the first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON array
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Extract `Name` and `Email` fields
        const parsedData = jsonData.map((row) => ({
          name: row["Name"] || "N/A", // Default to "N/A" if `Name` is missing
          email: row["Email"] || "N/A", // Default to "N/A" if `Email` is missing
        }));

        // Extract only emails for later use
        const emails = jsonData
          .map((row) => row["Email"])
          .filter((email) => email); // Filter out empty emails

        // Update state with extracted data
        setCandidateEmails(emails);
        setCandidateData(parsedData);
        setUploadStatus("File uploaded successfully");
      };

      // Read the file
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting candidate data:", candidateData);
      console.log("Submitting candidate emails:", candidateEmails);

      // Store data in localStorage for backup
      // localStorage.setItem("candidateEmails", JSON.stringify(candidateEmails));
      // localStorage.setItem("candidateData", JSON.stringify(candidateData));

      // Send candidate data to backend API
      const response = await axios.post(`${BACKEND_URL}/updateUser`, {
        userId: localStorage.getItem("userId"), // Assume recruiter is logged in and we have their email
        candidateData, // Send the array of candidate objects
      });

      if (response.status === 200) {
        console.log(
          "Candidates successfully updated in backend:",
          response.data
        );
        setIsSubmitted(true);
        setUploadStatus("Candidates submitted successfully!");
        setTimeout(() => {
          navigate("/roundSelection");
        }, 1200);
      }
    } catch (error) {
      console.error("Error updating candidates:", error);
      setUploadStatus("Failed to submit candidates. Please try again.");
    }
  };

  // Pagination
  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = candidateData.slice(
    indexOfFirstCandidate,
    indexOfLastCandidate
  );

  // Calculate total pages
  const totalPages = Math.ceil(candidateData.length / candidatesPerPage);

  // Page change handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-center text-white flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-3"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Candidate Shortlist Upload
          </h1>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">
              Instructions for Recruiters:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-blue-700">
              <li>
                Prepare an Excel file with these columns:
                <ul className="list-circle pl-5 mt-2">
                  <li>Name (Candidates full name)</li>
                  <li>Email (Candidates contact email)</li>
                </ul>
              </li>
              <li>Ensure column names match the required format</li>
              <li>Upload only .xlsx or .xls files</li>
            </ul>
          </div>

          <div className="relative group">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className="w-full p-6 border-2 border-dashed border-blue-300 
                            rounded-lg bg-blue-50 text-center 
                            group-hover:bg-blue-100 group-hover:border-blue-500
                            transition-all duration-300
                            flex items-center justify-center"
            >
              <span className="text-blue-700 font-semibold group-hover:text-blue-900 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                {file ? file.name : "Click to Upload Excel File"}
              </span>
            </div>
          </div>

          {uploadStatus && (
            <p
              className={`text-center p-3 rounded-lg shadow-md ${
                uploadStatus.includes("successfully")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {uploadStatus}
            </p>
          )}

          {candidateData.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-md rounded-lg">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <th className="border p-3">Name</th>
                      <th className="border p-3">Email </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCandidates.map((candidate, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 transition-colors even:bg-gray-50"
                      >
                        <td className="border p-3 text-center">
                          {candidate.name}
                        </td>
                        <td className="border p-3 text-center">
                          {candidate.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded 
                             disabled:bg-gray-300 disabled:cursor-not-allowed 
                             hover:bg-blue-600 transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-500 text-white rounded 
                             disabled:bg-gray-300 disabled:cursor-not-allowed 
                             hover:bg-blue-600 transition-colors"
                >
                  Next
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitted}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg 
                             hover:bg-green-600 transition-colors 
                             disabled:bg-gray-300 disabled:cursor-not-allowed 
                             font-semibold text-lg shadow-md"
                >
                  {isSubmitted ? "Submitted" : "Submit Candidates"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateUpload;
