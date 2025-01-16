import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Button, Input, Upload, message, Table, Row, Col, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { db, collection, addDoc, getDocs } from '../firebase-config'; // Import Firestore functions
import '../styles/Academic.css'; // Adjust the path according to your file structure


const Academic = () => {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [firestoreData, setFirestoreData] = useState([]); // State to store fetched Firestore data
  const [csvPagination, setCsvPagination] = useState({ current: 1, pageSize: 10 });
  const [firestorePagination, setFirestorePagination] = useState({ current: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false); // Loading state for async operations

  // Function to handle file upload and CSV parsing
  const handleFileChange = (file) => {
    if (file.name.endsWith('.csv')) {
      setFileName(file.name);

      Papa.parse(file, {
        complete: (result) => {
          setCsvData(result.data); // Storing the parsed CSV data
        },
        header: true, // If CSV has a header row
        skipEmptyLines: true, // Skip empty lines in CSV
      });
    } else {
      message.error('Please upload a valid CSV file.');
    }
  };

  // Function to save CSV data to Firestore (Avoiding duplicates)
  const handleSubmit = async () => {
    if (csvData.length > 0) {
      setLoading(true); // Set loading state to true while data is being submitted
  
      try {
        // Find duplicates between CSV data and Firestore data
        const duplicates = findDuplicates();
  
        if (duplicates.length > 0) {
          // Show error message if duplicates exist in the CSV
          message.error('Duplicate entries found in the CSV data. These entries will not be saved.');
        }
  
        // Filter out duplicates from the CSV data
        const filteredCsvData = csvData.filter((csvRow) => {
          return !firestoreData.some((firestoreRow) => {
            return Object.keys(csvRow).every((key) => csvRow[key] === firestoreRow[key]);
          });
        });
  
        if (filteredCsvData.length > 0) {
          // Split data into smaller chunks to avoid Firestore document size limit
          const CHUNK_SIZE = 500; // Adjust the chunk size based on your data
          const chunks = [];
          for (let i = 0; i < filteredCsvData.length; i += CHUNK_SIZE) {
            chunks.push(filteredCsvData.slice(i, i + CHUNK_SIZE));
          }
  
          // Save each chunk of data as a separate document in Firestore
          for (let i = 0; i < chunks.length; i++) {
            await addDoc(collection(db, 'databaseacad'), {
              data: chunks[i], // Save each chunk of data in a separate document
            });
          }
  
          message.success('Non-duplicate data submitted successfully');
          setCsvData([]); // Clear CSV data after submission
          fetchFirestoreData(); // Fetch updated Firestore data
        } else {
          message.warning('No new non-duplicate data to submit');
        }
      } catch (e) {
        message.error('Error submitting data: ', e);
      } finally {
        setLoading(false); // Reset loading state
      }
    }
  };

  // Fetch data from Firestore
  const fetchFirestoreData = async () => {
    setLoading(true); // Set loading state to true while data is being fetched

    try {
      const querySnapshot = await getDocs(collection(db, 'databaseacad'));
      const firestoreDataArr = [];
      querySnapshot.forEach((doc) => {
        firestoreDataArr.push(...doc.data().data); // Push data field from each document
      });
      setFirestoreData(firestoreDataArr);
    } catch (error) {
      message.error('Error fetching Firestore data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // UseEffect to fetch data when component mounts
  useEffect(() => {
    fetchFirestoreData();
  }, []); // Empty dependency array means this runs once when the component mounts

  // Ant Design table columns (this can be adjusted based on CSV structure)
  const columns = csvData && csvData.length > 0
    ? Object.keys(csvData[0]).map(key => ({
        title: key,
        dataIndex: key,
        key: key,
      }))
    : [];

  // Ant Design table columns for Firestore data
  const firestoreColumns = firestoreData && firestoreData.length > 0
    ? Object.keys(firestoreData[0]).map(key => ({
        title: key,
        dataIndex: key,
        key: key,
      }))
    : [];

  // Handle pagination changes for CSV data
  const handleCsvPaginationChange = (page, pageSize) => {
    setCsvPagination({
      current: page,
      pageSize,
    });
  };

  // Handle pagination changes for Firestore data
  const handleFirestorePaginationChange = (page, pageSize) => {
    setFirestorePagination({
      current: page,
      pageSize,
    });
  };

  // Paginate the CSV data based on pagination state
  const paginatedCsvData = csvData
    ? csvData.slice((csvPagination.current - 1) * csvPagination.pageSize, csvPagination.current * csvPagination.pageSize)
    : [];

  // Paginate the Firestore data based on pagination state
  const paginatedFirestoreData = firestoreData
    ? firestoreData.slice((firestorePagination.current - 1) * firestorePagination.pageSize, firestorePagination.current * firestorePagination.pageSize)
    : [];

  // Function to find duplicates between CSV and Firestore data
  const findDuplicates = () => {
    // Check if csvData and firestoreData are valid arrays
    if (!Array.isArray(csvData) || !Array.isArray(firestoreData)) return [];

    return csvData.filter((csvRow) => {
      return firestoreData.some((firestoreRow) => {
        // Check if the row data from CSV matches the Firestore row
        return Object.keys(csvRow).every((key) => {
          return csvRow[key] === firestoreRow[key];
        });
      });
    });
  };

  // Find duplicate rows and non-duplicate rows
  const isDuplicate = (row) => {
    return firestoreData.some((firestoreRow) => {
      return Object.keys(row).every((key) => {
        // Compare both Firestore and CSV values for exact matches
        return row[key]?.toString().trim() === firestoreRow[key]?.toString().trim();
      });
    });
  };
  

  // Function to highlight row based on duplicate status
  const getRowClass = (record) => {
    if (isDuplicate(record)) {
      return 'duplicate-row'; // Apply the red background for duplicates
    } else {
      return 'non-duplicate-row'; // Apply the green background for non-duplicates
    }
  };
  

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Academic Data</h2>

      {/* File upload using Ant Design Upload component */}
      <Upload
        beforeUpload={(file) => {
          handleFileChange(file); // Parse the file right away
          return false; // Prevent auto upload (since we're handling it manually)
        }}
        showUploadList={false}
        accept=".csv"
      >
        <Button icon={<UploadOutlined />}>Choose CSV File</Button>
      </Upload>

      {/* Display the file name */}
      {fileName && (
        <Input
          disabled
          value={`Selected File: ${fileName}`}
          style={{ marginTop: '10px', width: '100%' }}
        />
      )}

      {/* Display parsed CSV data and Firestore data in two tables side by side */}
      <Row gutter={16} style={{ marginTop: '20px' }}>
        <Col span={12}>
          {/* Table 1: Parsed CSV Data */}
          {csvData && (
            <div>
              <h3>Parsed CSV Data:</h3>
              <Table
                dataSource={paginatedCsvData}
                columns={columns}
                rowKey={(record, index) => index}
                pagination={{
                  current: csvPagination.current,
                  pageSize: csvPagination.pageSize,
                  total: csvData.length,
                  onChange: handleCsvPaginationChange,
                }}
                scroll={{ y: 400 }} // Increased table height
                rowClassName={getRowClass} // Apply row class based on duplication check
              />
            </div>
          )}
        </Col>

        <Col span={12}>
          {/* Table 2: Firestore Data */}
          {firestoreData.length > 0 && (
            <div>
              <h3>Firestore Data:</h3>
              <Table
                dataSource={paginatedFirestoreData}
                columns={firestoreColumns}
                rowKey={(record, index) => index}
                pagination={{
                  current: firestorePagination.current,
                  pageSize: firestorePagination.pageSize,
                  total: firestoreData.length,
                  onChange: handleFirestorePaginationChange,
                }}
                scroll={{ y: 400 }} // Increased table height
                rowClassName={getRowClass} // Apply row class based on duplication check
              />
            </div>
          )}
        </Col>
      </Row>

      {/* Submit button */}
      <Button
        type="primary"
        onClick={handleSubmit}
        style={{ marginTop: '20px' }}
        disabled={csvData.length === 0 || loading}
      >
        {loading ? <Spin /> : 'Submit Data'}
      </Button>
    </div>
  );
};

export default Academic;
