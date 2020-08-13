const differenceInMinutes = require('date-fns/difference_in_minutes');
const differenceInSeconds = require('date-fns/difference_in_seconds');

const fabricsList = require('../constants/fabricsList');
const processesList = require('../constants/processes');
const Excel = require('../constants/excel');

const ftp = require("basic-ftp");
const fs = require('fs');
const ExcelJS = require('exceljs');
const Db = require("./db");

const timeDifferenceInMinutes = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setSeconds(0);
    endDate.setSeconds(0);
    const duration = Math.round(differenceInSeconds(endDate, startDate)/60);
    return duration;
}

const applyLunch = (tour, lunch) => {
    const withLunchTour = {...tour};
    const justAfterLunchActivitiesBlockIndex = withLunchTour.activitiesBlocks.findIndex((activitiesBlock) => {
        const activitiesBlockTime = ("datetime" in activitiesBlock) ? activitiesBlock.datetime : activitiesBlock.datetimeEnd;
        return new Date(activitiesBlockTime) >= new Date(lunch.end);
    });
    // console.log("just After Lunch ActivitiesBlock Index: ", justAfterLunchActivitiesBlockIndex);

    if(justAfterLunchActivitiesBlockIndex >= 0) {
        const lunchDuration = differenceInMinutes(new Date(lunch.end), new Date(lunch.start));
        let oldDuration;
        if("duration" in withLunchTour.activitiesBlocks[justAfterLunchActivitiesBlockIndex]) {
            oldDuration = withLunchTour.activitiesBlocks[justAfterLunchActivitiesBlockIndex].duration;
            withLunchTour.activitiesBlocks[justAfterLunchActivitiesBlockIndex].duration = Math.abs(oldDuration - lunchDuration);
        }
        if("durationForDashboard" in withLunchTour.activitiesBlocks[justAfterLunchActivitiesBlockIndex]) {
            oldDuration = withLunchTour.activitiesBlocks[justAfterLunchActivitiesBlockIndex].durationForDashboard
            withLunchTour.activitiesBlocks[justAfterLunchActivitiesBlockIndex].durationForDashboard = Math.abs(oldDuration - lunchDuration);
        }
    }
    return withLunchTour;
};

const applyDurationsToActivitiesBlocksForDashboard = (tour) => {

    if(tour === undefined) return undefined;

    let tempTour = {...tour};

    for(let i = 0; i < tempTour.activitiesBlocks.length; i++) {
        let duration = 0;
        if(("datetime" in tempTour.activitiesBlocks[i]) && tempTour.activitiesBlocks[i].datetime) {
            let firstDate = new Date(tempTour.activitiesBlocks[i].datetime);
            let secondDate;
            if(i === 0) {
                secondDate = new Date(tour.start);
            } else {
                secondDate = new Date(tempTour.activitiesBlocks[i - 1].datetime);
            }
            duration = timeDifferenceInMinutes(secondDate, firstDate);
        } else {
            duration = timeDifferenceInMinutes(tempTour.activitiesBlocks[i].datetimeStart, tempTour.activitiesBlocks[i].datetimeEnd);
        }
        tempTour.activitiesBlocks[i].durationForDashboard = duration;
    }

    // console.log ("applyDurationsToActivitiesBlocksForDashboard: Tour with durations without applying lunch: ", tempTour);

    if(("lunch") in tempTour && tempTour.lunch && tempTour.lunch.length) {
        tempTour.lunch.map((lunch) => {
            tempTour = applyLunch(tempTour, lunch);
        });
        // console.log ("applyDurationsToActivitiesBlocksForDashboard: Tour with durations lunch applied: ", tempTour);
    } else {
        // console.log("There are no lunch for apply");
    }

    return tempTour;

}

class Ftp {
    static getFileFromFtp = async (fileName) => {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: true
            });
            console.log(await client.list());
            await client.downloadTo(fileName, fileName);
            client.close();
            return fs.readFileSync(fileName, 'utf8');
        }
        catch(err) {
            console.log(err);
            client.close();
            return false;
        }
    }

    static uploadFileToFtp = async (localPathFileName, remoteFileName) => {
        const client = new ftp.Client();
        client.ftp.verbose = true;
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                secure: false
            });
            console.log(await client.list());
            await client.uploadFrom(localPathFileName, remoteFileName);
            client.close();
            return true;
        }
        catch(err) {
            console.log(err);
            client.close();
            return false;
        }
    }

    static uploadDataFile = async (fileName) => {
        const data = await Db.getAllTours();
        const tours = data.map((tour) => applyDurationsToActivitiesBlocksForDashboard(tour._doc));
        console.log("Getting tours complete");
        // const aloneActivitiesBlocks = await Db.getAloneActivitiesBlocks();
        // console.log("Getting aloneActivitiesBlocks complete");
        const excelFileResult = await this.createExcel(fileName, tours, []);
        if (excelFileResult) {
            console.log("Excel created");
            const uploadingResult = await this.uploadFileToFtp(fileName, `/change/access/${fileName}`);
            if(uploadingResult) {
                console.log("Excel file uploaded");
            } else {
                console.log("Excel file uploading error");
            }
        } else {
            console.log("Excel creating error");
        }
    }

    static createExcel = async (fileName, tours, aloneActivitiesBlocks) => {

        const rows = tours.reduce((acc, tour) => {
            if(!tour) return acc;
            for(let i = 0; i < tour.activitiesBlocks.length; i++) {
                if(("isMate" in tour.activitiesBlocks[i]) && tour.activitiesBlocks[i].isMate === true) {
                    // console.log("This is mate block so omit it: ", tour.activitiesBlocks[i]);
                    continue;
                }
                let usersArray = [tour.userName];
                let material = null;
                let longMeters = null;
                let dateString = "";
                let timeString = "";
                if(("datetime" in tour.activitiesBlocks[i]) && tour.activitiesBlocks[i].datetime) {
                    dateString = new Date(tour.activitiesBlocks[i].datetime).toLocaleDateString();
                    timeString = new Date(tour.activitiesBlocks[i].datetime).toLocaleTimeString();
                } else {
                    dateString = new Date(tour.activitiesBlocks[i].datetimeEnd).toLocaleDateString();
                    timeString = new Date(tour.activitiesBlocks[i].datetimeEnd).toLocaleTimeString();
                }
                const duration = tour.activitiesBlocks[i]["durationForDashboard"];
                if("materials" in tour.activitiesBlocks[i] && tour.activitiesBlocks[i].materials && tour.activitiesBlocks[i].materials.length) {
                    const materialObj = fabricsList.find((fabric) => tour.activitiesBlocks[i].materials[0].name === fabric.name);
                    if(materialObj) {
                        material = materialObj.in_db_name;
                    }
                    longMeters = tour.activitiesBlocks[i].materials[0].longMeters;
                }
                if(("mate" in tour.activitiesBlocks[i]) && tour.activitiesBlocks[i].mate !== null && tour.activitiesBlocks[i].mate !== undefined && tour.activitiesBlocks[i].mate.length) {
                    // console.log("ActivitiesBlock with mate: ", tour.activitiesBlocks[i]);
                    usersArray.push(tour.activitiesBlocks[i].mate);
                }

                const process = tour.activitiesBlocks[i].process;
                const processObj = processesList.find((processObj) => processObj.name === process);
                let subproductsIdsArray = [];

                if(processObj) {
                    subproductsIdsArray.push(processObj.subproductsIds)
                }

                acc.push({
                    usersArray,
                    date: dateString,
                    time: timeString,
                    activities: tour.activitiesBlocks[i].activities,
                    process,
                    subproducts: subproductsIdsArray,
                    plotter: ("plotter" in tour.activitiesBlocks[i]) ? tour.activitiesBlocks[i].plotter : null,
                    duration,
                    material,
                    longMeters,
                    department: tour.department
                });
            }
            return acc;
        }, []);

        aloneActivitiesBlocks.map((aloneActivitiesBlock) => {
            let usersArray = [aloneActivitiesBlock.userName];
            let material = null;
            let longMeters = null;
            let dateString = "";
            let timeString = "";
            if(("datetime" in aloneActivitiesBlock) && aloneActivitiesBlock.datetime) {
                dateString = new Date(aloneActivitiesBlock.datetime).toLocaleDateString();
                timeString = new Date(aloneActivitiesBlock.datetime).toLocaleTimeString();
            } else {
                dateString = new Date(aloneActivitiesBlock.datetimeEnd).toLocaleDateString();
                timeString = new Date(aloneActivitiesBlock.datetimeEnd).toLocaleTimeString();
            }
            const duration = aloneActivitiesBlock["durationForDashboard"];
            if("materials" in aloneActivitiesBlock && aloneActivitiesBlock.materials && aloneActivitiesBlock.materials.length) {
                const materialObj = fabricsList.find((fabric) => aloneActivitiesBlock.materials[0].name === fabric.name);
                if(materialObj) {
                    material = materialObj.in_db_name;
                }
                longMeters = aloneActivitiesBlock.materials[0].longMeters;
            }
            if(("mate" in aloneActivitiesBlock) && aloneActivitiesBlock.mate !== null && aloneActivitiesBlock.mate !== undefined && aloneActivitiesBlock.mate.length) {
                // console.log("ActivitiesBlock with mate: ", tour.activitiesBlocks[i]);
                usersArray.push(aloneActivitiesBlock.mate);
            }

            rows.push({
                usersArray,
                date: dateString,
                time: timeString,
                activities: aloneActivitiesBlock.activities,
                process: aloneActivitiesBlock.process,
                plotter: ("plotter" in aloneActivitiesBlock) ? aloneActivitiesBlock.plotter : null,
                duration,
                material,
                longMeters,
                department: aloneActivitiesBlock.department
            });
        });

        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Лист 1');

        let activitiesBlocksRows = [];

        //                               A                  B                     C           D         E
        activitiesBlocksRows.push([ 'Участок', 'Табельный номер сотрудника', 'Сотрудник', 'Дата', 'Номер заказа',
            //            F                         G                           H                 I                   J
            'Кол-во полуфабрикатов продукта','Наименование продукта', 'Кол-во изделий', 'Кол-во полуфабрикатов', 'Материал',
            //           K          L            M                N             O                  P       Q
            'Кол-во материала', 'Операция', 'Полуфабрикаты', 'Номер плоттера', 'Длительность', 'Время', 'id']);

        for(let i = 0; i < rows.length; i++) {

            let productPartsStr = '';
            let userIdStr = '';
            let units = 0;
            let parts = 0;
            for(let j = 0; j < rows[i].activities.length; j++) {
                if(rows[i].activities[j].isPartial) {
                    units = 0;
                    parts = rows[i].activities[j].count;
                } else {
                    parts = 0;
                    units = rows[i].activities[j].count;
                }
                const userName = rows[i].usersArray.join("\n");

                activitiesBlocksRows.push([
                    rows[i].department,
                    userIdStr,
                    userName,
                    rows[i].date,
                    rows[i].activities[j].order,
                    productPartsStr,
                    rows[i].activities[j].product,
                    units,
                    parts,
                    rows[i].material,
                    rows[i].longMeters,
                    rows[i].process,
                    rows[i].subproducts.join(', '),
                    rows[i].plotter,
                    rows[i].duration,
                    rows[i].time,
                    `${i + 1}`
                ]);
            }
        }

        console.log('Collect data for excel complete with length: ', activitiesBlocksRows.length);

        worksheet.addRows([...activitiesBlocksRows]);

        let masterRow = 1;
        for(let i = 2; i <= activitiesBlocksRows.length; i++) {
            const currentRowNumber = worksheet.getRow(i).getCell(Excel.recordNumberColumn).value;
            const masterRowNumber = worksheet.getRow(masterRow).getCell(Excel.recordNumberColumn).value;
            if(currentRowNumber === masterRowNumber) {
                // console.log("currentRowNumber = previousRowNumber: ", currentRowNumber, masterRowNumber);
            } else if(masterRow !== (i - 1)){
                // console.log("gonna merge: ", `${Excel.departmentColumn}${masterRow}:${Excel.departmentColumn}${i - 1}`);
                worksheet.mergeCells(`${Excel.departmentColumn}${masterRow}:${Excel.departmentColumn}${i - 1}`);
                worksheet.mergeCells(`${Excel.tabelUserNumber}${masterRow}:${Excel.tabelUserNumber}${i - 1}`);
                worksheet.mergeCells(`${Excel.userNameColumn}${masterRow}:${Excel.userNameColumn}${i - 1}`);
                worksheet.mergeCells(`${Excel.dateColumn}${masterRow}:${Excel.dateColumn}${i - 1}`);
                worksheet.mergeCells(`${Excel.materialColumn}${masterRow}:${Excel.materialColumn}${i - 1}`);
                worksheet.mergeCells(`${Excel.longMetersColumn}${masterRow}:${Excel.longMetersColumn}${i - 1}`);
                worksheet.mergeCells(`${Excel.processColumn}${masterRow}:${Excel.processColumn}${i - 1}`);
                worksheet.mergeCells(`${Excel.subproductsIdsColumn}${masterRow}:${Excel.subproductsIdsColumn}${i - 1}`);
                worksheet.mergeCells(`${Excel.plotterColumn}${masterRow}:${Excel.plotterColumn}${i - 1}`);
                worksheet.mergeCells(`${Excel.durationColumn}${masterRow}:${Excel.durationColumn}${i - 1}`);
                worksheet.mergeCells(`${Excel.timeColumn}${masterRow}:${Excel.timeColumn}${i - 1}`);
                masterRow = i;
            } else {
                masterRow = i;
            }
        }

        console.log('Cells merged');

        worksheet.getRow(1).height = Excel.heightExcelRow * 2;

        for(let i = 1; i <= Excel.columnsCount; i++) {
            worksheet.getColumn(i).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        }

        console.log('Cells alignment complete');

        worksheet.getColumn(Excel.departmentColumn).width = 24;
        worksheet.getColumn(Excel.tabelUserNumber).width = 10;
        worksheet.getColumn(Excel.userNameColumn).width = 24;
        worksheet.getColumn(Excel.dateColumn).width = 11;
        worksheet.getColumn(Excel.orderNumberColumn).width = 10;
        worksheet.getColumn(Excel.productPartsColumn).width = 10;
        worksheet.getColumn(Excel.productColumn).width = 80;
        worksheet.getColumn(Excel.unitsColumn).width = 10;
        worksheet.getColumn(Excel.partsColumn).width = 10;
        worksheet.getColumn(Excel.materialColumn).width = 30;
        worksheet.getColumn(Excel.processColumn).width = 35;
        worksheet.getColumn(Excel.subproductsIdsColumn).width = 10;
        worksheet.getColumn(Excel.plotterColumn).width = 10;
        worksheet.getColumn(Excel.durationColumn).width = 10;
        worksheet.getColumn(Excel.timeColumn).width = 10;
        worksheet.getColumn(Excel.longMetersColumn).width = 10;

        console.log('Setting cells width complete');

        try{
            await workbook.xlsx.writeFile(fileName);
            return true;
        } catch(e) {
            console.log("Creating excel file error: ", e);
            return false;
        }
    }
}

module.exports = Ftp;