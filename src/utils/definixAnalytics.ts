import axios from 'axios'

export const sendAnalyticsData = (
    pid:number,
    address:string,
) =>{
   axios.post("https://qm9mge0ydb.execute-api.ap-southeast-1.amazonaws.com/prod/definix-analytics",{address,pid}).then((res)=>{
    console.log("res",res)
   }).catch((e)=>{
    console.log("err ",e)
   })
}
export default sendAnalyticsData