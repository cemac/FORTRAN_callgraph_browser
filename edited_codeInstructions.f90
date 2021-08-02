
PROGRAM readme.f90
!This is where the function code appears
!***************************************
! Instructions are given below
!***************************************

    DO (click_on_node)
        CALL read_code_here(node)
        
        IF mouseover calls (red links) THEN
        
            call location is showed HERE in purple.
            
            The subroutine names are found using the regular 
            expression format of /\b<name>\b/i
            
        END IF 
        
        SELECT CASE (codewindow)
            ! custom parsing using keyboard commands
            CASE ('ctrl+F')
                This opens a regex search window for your code.
                
            CASE ('ctrl+G')
                Find Next !when searching
                
            CASE ('ctrl+S')
                WRITE(* , edited_<originfile>.f90)
                the currently edited window to
                the directory the app resides.
                
            CASE ('ctrl+R')
                Refresh this window and return the instructions
                
            CASE DEFAULT !(shortcuts)
                Other shortcuts can be found at 
                'https://defkey.com/codemirror-shortcuts'
                
        END SELECT 
                  
    END DO
    
END PROGRAM
    