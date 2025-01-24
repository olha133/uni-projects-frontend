export default function processOpnFrmData(event){
    //1.prevent normal event (form sending) processing
    event.preventDefault();

    //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
    const nopName = document.getElementById("name").value.trim();
    const nopEml = document.getElementById("email").value.trim();
    const nopImg = document.querySelector("#image");
    const nopRad = document.querySelectorAll("input[name='type']");
    const nopKey = document.querySelector("#keywords");
    const nopOpn = document.getElementById("feedback").value.trim();

    //3. Verify the data
    if(nopName==="" || nopOpn===""){
        window.alert("Please, enter both your name and opinion");
        return;
    }
    if(!document.getElementById("agree").checked){
        window.alert("Please, agree to the Privacy Policy");
        return;
    }
    const imageValue = nopImg.value.trim();
    let radioValue;

    for (const button of nopRad) if (button.checked) radioValue = button.value;
    const keywordValue = nopKey.value.trim();
    //3. Add the data to the array opinions and local storage
    const newOpinion =
        {
            name: nopName,
            email: nopEml,
            image: imageValue,
            type: radioValue,
            keywords: keywordValue,
            feedback: nopOpn,
            created: new Date().toDateString(),

        };


    let opinions = [];

    if(localStorage.myFeedback){
        opinions=JSON.parse(localStorage.myFeedback);
    }

    opinions.push(newOpinion);
    localStorage.myFeedback = JSON.stringify(opinions);


    //5. Go to the opinions
    window.location.hash="#opinions";

}
