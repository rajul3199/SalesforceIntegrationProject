import MailingPostalCode from '@salesforce/schema/Contact.MailingPostalCode';
import { LightningElement } from 'lwc';

export default class VaccineSlotFinder extends LightningElement {
    dates = [];
    centers = [];

    pincodeChangeHandler(event){
        const pincode = event.target.value;
        const isEnterKey = event.keyCode === 13;
        if(pincode.length === 6 && isEnterKey){
            const today = new Date();
            const formattedDate = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
            const endpoint = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pincode}&date=${formattedDate}`;
            this.fetchVaccineSlots(endpoint);
        }
    }

    async fetchVaccineSlots(endpoint){
        const vaccineSlotRes = await fetch(endpoint);
        const slotsData = await vaccineSlotRes.json();
        this.buildColoumsAndRows(slotsData.centers);
    }

    buildColoumsAndRows(data){
       // build columns/dates
        const dates = new Map();
        dates.set("name", {
            label: "Center Name",
            fieldName: "name",
            type: "text",
            wrapText: true
        });

        const centers = new Map();

        for (const center of data) {
            !centers.has(center.center_id) &&
              centers.set(center.center_id, { name: center.name });
      
            for (const session of center.sessions) {
              // destructuring syntax
              const { date, available_capacity, min_age_limit } = session;
      
              // add date as column in dates map
              dates.set(date, {
                label: date,
                fieldName: date,
                type: "text",
                wrapText: true,
                cellAttributes : {class : { fieldName : "className"}}
              });

              centers.get(center.center_id)[date] = `Available Capacity : ${available_capacity}
              Minimum Age : ${min_age_limit}`;
              centers.get(center.center_id).className = available_capacity > 0 ? "slds-text-color_success" : "slds-text-color_error";
            }
        }
        this.dates = Array.from(dates.values());
        this.centers = Array.from(centers.values()) 
    }

    get hideMessage(){
        return this.centers.length > 0;
    }
}