(function() {

    $('#form').on('submit', function(event) {
        event.preventDefault()


        $.ajax({

            method: "PUT",
            url: `/Examiner/approve`,
            data: {

                
            }


        })
        
    })
    
})