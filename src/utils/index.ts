import { batchType } from "./file.js";

export const getBatchLabel = (batch: batchType) => {
    if(batch.startLine === batch.endLine){
        return `Line ${batch.startLine}`
    } else {
        return `Line ${batch.startLine} - ${batch.endLine}`
    }
}