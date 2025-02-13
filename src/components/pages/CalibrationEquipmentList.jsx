import { Box, Button, ButtonGroup, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import useAxiosPrivate from '../../utils/useAxiosPrivate';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
// import ImportExportRoundedIcon from '@mui/icons-material/ImportExportRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import Popup from './Popup';
import CalibrationEquipmentForm from './CalibrationEquipmentForm';
//import { calibrationform } from './Validationform';
import { useFormik } from "formik";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PropTypes from "prop-types";
import * as Yup from 'yup';

const calibrationform = Yup.object({
    modelbrand: Yup.string().required("Please enter modelbrand"),
    idnumber: Yup.string().required("Please enter idnumber"),
    location: Yup.string().required("Please enter location"),
    date: Yup.string().required("Please enter date"),
  
     duedate: Yup.string().required("Please enter duedate "),
     docupdate: Yup.string().required("Update file"),
  
      calibration: Yup.string().required("Please enter calibration Equipment"),
    
  });

const CalibrationEquipmentList = () => {


    const [rowData, setRowData] = useState([]);

    const [colDefs, setColDefs] = useState([]);

    const [openPopup, setOpenPopup] = useState(false);

    const axiosClientPrivate = useAxiosPrivate();

    const [id,setId] = useState(1);

    const [showupdate,setShowupdate] = useState(false);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    const initialValues = {
       

        calibration: "",
        modelbrand: "",
        idnumber: "",
        location: "",
        date: "",
        duedate:"",
        docupdate:"",
        lastModified:"",
        modifiedBy:""

      };


      const {
        values,
        touched,
        errors,
        handleBlur,
        handleChange,
        setFieldValue,
        handleSubmit,
        resetForm
      } = useFormik({
        initialValues: initialValues,
        validationSchema: calibrationform,
        onSubmit: async (values, {resetForm}) => {
            try {
                const response = await axiosClientPrivate.post('/medicallist', values);
                toast.success("Saved Successfully!",{
                    position:"top-center"
                 }); 
                       // getting id(key,value) of last index
                   // const id = rowData[rowData.length-1].Id;
                   // const obj = {
                      //  Id : id+1,
                      //  ...values
                  //  }
                 //console.log(obj);
                // setRowData(rowData => [...rowData, obj]);
                setFetchTrigger(prev => prev+1);
                console.log('Response:', response.data);
                resetForm();
              } catch (error) {
                console.log(values);
                console.error('Error:', error);
              }
            },
          });
    



      const handleEdit = async (id) => {
        alert(id);
        try {
          const response = await axiosClientPrivate.get(`/business-units/${id}`);
            console.log(response.data);
            setFieldValue("id",response.data.id);
            setFieldValue("calibration",response.data.calibration);
            setFieldValue(" modelbrand",response.data.modelbrand);
            setFieldValue("idnumber",response.data.idnumber);
            setFieldValue("location",response.data.location);
            setFieldValue("date",response.data.date);
            setFieldValue("duedate",response.data.duedate);
            setFieldValue("docupdate",response.data.docupdate);
            setFieldValue("lastModified", response.data.lastModified);
            setFieldValue("modifiedBy", response.data.modifiedBy);
          setId(id);
          setShowupdate(true);
          setOpenPopup(true);
        } catch (error) {
          console.error('Error fetching item for edit:', error);
        }
      };

      const handleUpdate = async (id)=> {
        alert(id);
        const update = values;
        try{
             console.log(values);
             await axiosClientPrivate.put(`/business-units/${id}`,update);
             toast.success("Updated Successfully!",{
                position:"top-center",
                autoClose: 3000,
             });
             resetForm();
            //  setRowData(rowData => [...rowData,values]);/
            setFetchTrigger(prev => prev+1);

        }
        catch(err){
            console.log(values);
            console.log(err);
        }
      }


     // to delete a row
     const handleDeleteRow = async (id) => {
        alert(id)
       if(window.confirm('Are you sure you want to delete this data?')){
       try {
           await axiosClientPrivate.delete(`/business-units/${id}`);
        //    setRowData(prevData => prevData.filter(row => row.buId !== id));
        setFetchTrigger(prev => prev+1);
    } catch (error) {
           console.error('Error deleting row:', error);
       }
   }
   };

   const CustomActionComponent = ({id}) => {
    CustomActionComponent.propTypes = {
        id: PropTypes.number.isRequired,
      };
    return <div> <Button onClick={() =>  handleEdit(id)} > <EditNoteRoundedIcon /></Button>
       <Button color="error" onClick={() => handleDeleteRow(id)}> <DeleteSweepRoundedIcon /> </Button> </div>

};

    const pagination = true;
    const paginationPageSize = 50;
    const paginationPageSizeSelector = [50, 100, 200, 500];

    useEffect(() => {
        const controller = new AbortController();

        const getAllOhc = async () => {
            try {
                const response = await axiosClientPrivate.get('business-units', { signal: controller.signal });
                const items = response.data;
                    // console.log(items);
                setRowData(items);
                if (items.length > 0) {
                   const  columns = Object.keys(items[0]).map(key => ({
                        field: key,
                        headerName: key.charAt(0).toUpperCase() + key.slice(1),
                        filter: true,
                        floatingFilter: true,
                        sortable: true
                    }));

                    columns.unshift({
                        field: "Actions", cellRenderer:  (params) =>{
                            const id = params.data.id;
                            return <CustomActionComponent id={id} />
                        }
                    });

                    setColDefs(columns);
                }

                

            } catch (err) {
                console.error("Failed to fetch data: ", err);
                setRowData([]);
            }
        };

        getAllOhc();

        return () => {
            controller.abort();
        };

    }, [fetchTrigger]);

   
     

    const exportpdf = async () => {
        const doc = new jsPDF();
        const header = [['id', 'calibration',"modelbrand","idnumber","location","date","duedate","docupdate"]];
        const tableData = rowData.map(item => [
          item.id,
          item.calibration,
          item.modelbrand,
          item.idnumber,
          item.location,
          item.date,
          item.duedate,
          item.docupdate,
          
        ]);
        doc.autoTable({
          head: header,
          body: tableData,
          startY: 20, 
          theme: 'grid', 
          margin: { top: 30 }, 
          styles: { fontSize: 5 },
          columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' } }
      });
        doc.save("CalibrationEquipmentList.pdf");
    };


    const exportExcelfile = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('My Sheet');
        const headerStyle = {
          
          alignment: { horizontal: 'center' }
          
      };
  
      sheet.getRow(1).font = { bold: true };
        
        const columnWidths = {
            id: 10,
            calibration: 20,
            modelbrand: 15,
            idnumber: 15,
            location: 20,
            date: 15,
            duedate: 15,
            docupdate: 20,
            
      };
  
        sheet.columns = [
          { header: "id", key: 'id', width: columnWidths.id, style: headerStyle },
          { header: " calibration", key: 'buEmail', width: columnWidths.buEmail, style: headerStyle },
          { header: "modelbrand", key: 'buHeadName', width: columnWidths.buHeadName, style: headerStyle },
          { header: "idnumber", key: 'buName', width: columnWidths.buName, style: headerStyle },
          { header: " location", key: 'buEmail', width: columnWidths.buEmail, style: headerStyle },
          { header: "date", key: 'buHeadName', width: columnWidths.buHeadName, style: headerStyle },
          { header: "duedate", key: 'buName', width: columnWidths.buName, style: headerStyle },
          { header: "docupdate", key: 'buEmail', width: columnWidths.buEmail, style: headerStyle },
        
          
      ];
  
        rowData.map(product =>{
            sheet.addRow({
                id:product.id,
                calibration:product.calibration ,
                modelbrand:product.modelbrand,
                idnumber:product.idnumber,
                location:product.location,
                date:product.date,
                duedate:product.duedate,
                docupdate:product.docupdate,
            
            })
        });
  
        workbook.xlsx.writeBuffer().then(data => {
            const blob = new Blob([data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheet.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'CalibrationEquipmentList.xlsx';
            anchor.click();
            
        })
    }
   

    return (
        <>
        <ToastContainer />
            <Box
                className="ag-theme-quartz" 
                style={{ height: 500 }}
            >

                <Stack sx={{ display: 'flex', flexDirection: 'row' }} marginY={1} paddingX={1}>
                    <ButtonGroup variant="contained" aria-label="Basic button group">
                        <Button variant="contained" endIcon={<AddCircleOutlineRoundedIcon />} onClick={() => { setOpenPopup(true) }}>Add New</Button>
                        <Button variant="contained" onClick={exportpdf} color="success" endIcon={<PictureAsPdfIcon/>}>PDF</Button>
                        <Button variant="contained" onClick={()=> exportExcelfile()}  color="success" endIcon={<DownloadIcon/>}>Excel</Button>
                    </ButtonGroup>

                </Stack>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={colDefs}
                    animateRows={true} 
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                />
            </Box>

            <Popup showupdate={showupdate} id= {id} handleUpdate={handleUpdate} setShowupdate={setShowupdate} resetForm={resetForm} handleSubmit={handleSubmit}  openPopup={openPopup} setOpenPopup={setOpenPopup} title="Calibration Equipment">

                <CalibrationEquipmentForm values={values} touched={touched} errors={errors} handleBlur={handleBlur} handleChange={handleChange} setFieldValue={setFieldValue} handleSubmit={handleSubmit} />
                
            </Popup>
        </>
    );
};

export default CalibrationEquipmentList;
