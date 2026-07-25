async function deleteProduct(id){

    try{

        const response =
            await fetch(

                `/product/${id}`,

                {
                    method:"DELETE"
                }

            );

        const data =
            await response.json();

        if(data.success){

            window.location.reload();

        }

    } catch(error){

        console.log(error);

    }

}