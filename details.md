
# Actions

## View current work item links
![3 links child links on form: Part 1, Part 2, Part 3](img/viewLinks.png)
## Add a child a work item
![hover create child button](img/createChildHover.png)
![enter title for child](img/createChildType.png)  
Press Enter or exit focus to save. Press Esc or clear title to cancel.  
![child created](img/childCreated.png)
## Rename the work item
Click options -> rename or select then F2  
![select Part 4 workitem ](img/4selected.png)
![renaming to 'renamed'](img/renaming.png)  
Press Enter or exit focus to save new title. Press Esc to cancel  
![renamed saved](img/renamed.png)

## Reorder linked work items
Shift + (⬆ / ⬇)  
![move renamed up 1](img/moveUp.png)

## Delete linked work items
Click options -> delete or select then press Del  
![delete renamed](img/deleteRenamed.png)

## Unlink linked work items
Click options -> Unlink or select then press Ctrl + U  
![unlink Part 3](img/unlink3.png)  
Then save the work item to confirm link removal

# Why?
To make the functionality available on the board available in the work item form  
![Big feature work item on board with 2 child links: Part 1, Part 2](img/board.png)


# Configuration with on Team Services 

To configure where the board group is added click on the customize option from the work item form.  
![customize context image](img/customizeToolbar.png)  
Then drag the group where desired or hide it.  
![customize form](img/customizeForm.png)

# Configuration using process template

Navigate the process template xml.
For each work item type to customize at the location 
```xpath
/WITD/WORKITEMTYPE/FORM/WebLayout/Extensions
```
add 
```xml
<Extension Id="ottostreifel.links-group" />
```
Within the same Weblayout choose a Section element and add
```xml
<GroupContribution Label="Board" Id="ottostreifel.links-group.links-group"/>
```


# Change Log
(03/20/17) 1.0.1 Initial release
