(()=>{"use strict";const ERR_INVALID_SIGNATURE="Invalid signature";class Crc32{constructor(){this.crc=-1;this.table=(()=>{const table=[];for(let i=0;i<256;i++){let t=i;for(let j=0;j<8;j++){if(t&1){t=t>>>1^3988292384}else{t=t>>>1}}table[i]=t}return table})()}append(data){const table=this.table;let crc=this.crc|0;for(let offset=0,len=data.length|0;offset<len;offset++){crc=crc>>>8^table[(crc^data[offset])&255]}this.crc=crc}get(){return~this.crc}}const handlers={init:init,append:append,flush:flush};let task;addEventListener("message",(async event=>{const message=event.data;const type=message.type;const handler=handlers[type];if(handler){try{const response=await handler(message)||{};response.type=message.type;if(response.data){try{postMessage(response,[response.data.buffer])}catch(error){postMessage(response)}}else{postMessage(response)}}catch(error){postMessage({type:type,error:{message:error.message,stack:error.stack}})}}}));function init(message){if(message.scripts&&message.scripts.length>0){importScripts.apply(undefined,message.scripts)}const options=message.options;task={codecType:options.codecType,outputSigned:options.outputSigned,outputCompressed:options.outputCompressed,outputEncrypted:options.outputEncrypted,outputPassword:options.outputPassword,inputSigned:options.inputSigned,inputSignature:options.inputSignature,inputCompressed:options.inputCompressed,inputEncrypted:options.inputEncrypted,inputPassword:options.inputPassword,inputCrc32:options.inputSigned&&new Crc32,outputCrc32:options.outputSigned&&new Crc32,deflater:options.codecType=="deflate"&&new ZipDeflater,inflater:options.codecType=="inflate"&&new ZipInflater,decryption:options.inputEncrypted&&new ZipDecryption(options.inputPassword,options.inputSigned),encryption:options.outputEncrypted&&new ZipEncryption(options.outputPassword)}}async function append(message){const inputData=new Uint8Array(message.data);let data=inputData;if(task.inputEncrypted){data=await task.decryption.append(data)}if(task.inputCompressed&&data.length){data=task.inflater.append(data)}if(!task.inputEncrypted&&task.inputSigned){task.inputCrc32.append(data)}if(task.outputCompressed&&data.length){data=task.deflater.append(inputData)}if(task.outputEncrypted){data=await task.encryption.append(data)}else if(task.outputSigned){task.outputCrc32.append(inputData)}return{data:data}}async function flush(){let signature,data=new Uint8Array(0);if(task.inputEncrypted){const result=await task.decryption.flush();if(!result.valid){throw new Error(ERR_INVALID_SIGNATURE)}data=result.data}else if(task.inputSigned){const dataViewSignature=new DataView(new Uint8Array(4).buffer);signature=task.inputCrc32.get();dataViewSignature.setUint32(0,signature);if(task.inputSignature!=dataViewSignature.getUint32(0)){throw new Error(ERR_INVALID_SIGNATURE)}}if(task.inputCompressed){if(data.length){data=task.inflater.append(data)}await task.inflater.flush()}if(task.outputCompressed){data=task.deflater.flush()}if(task.outputEncrypted){data=await task.encryption.append(data);const result=await task.encryption.flush();signature=result.signature;const newData=new Uint8Array(data.length+result.data.length);newData.set(data,0);newData.set(result.data,data.length);data=newData}else if(task.outputSigned){signature=task.outputCrc32.get()}return{data:data,signature:signature}}})();
