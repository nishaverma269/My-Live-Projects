A project where I have done a FrontEnd work to redesign Input page for executing a routine to automate checks fill out in order.

Features:

1. Select routine and select part number filter.
2. If user click on execute routine, it will start the checks in order and user can click next until checks are finished and click save when all done.

My chunk of js code logic:

public nextCheck = () => {
            let element = document.getElementById(this.routineItemId());
            element.click();
}
public executeRoutine = () => {
            if (this.selectedPartNumber().id != 0) {
                this.routineChecks.sort(function (left, right) {
                    return (left.number === 0 || right.number === 0) ? 1 : ((left.number === right.number) ? 0 : ((left.number < right.number) ? -1 : 1));
                });
                var filteredChecks = []; //Filter routine checks based on filtered Part Number
                for (var i = 0, check = this.routineChecks[i]; i < this.routineChecks.length; i++ , check = this.routineChecks[i]) {
                    var filteredSpecsIndex = [];
                    for (var j = 0, spec = check.specs[j]; j < check.specs.length; j++ , spec = check.specs[j]) {
                        var deleteSpec = false;
                        if (spec.partNumbers.length >= 1) {
                            for (var k = 0; k < spec.partNumbers.length; k++) {
                                if (this.selectedPartNumber().identifier == spec.partNumbers[k].identifier) {
                                    deleteSpec = true;
                                }
                                if (deleteSpec == true) break;
                            }
                        }
                        if (deleteSpec == false) {
                            filteredSpecsIndex = filteredSpecsIndex.concat(j);
                        }
                    }
                    for (var l = filteredSpecsIndex.length - 1; l > -1; l--) {
                        check.specs.splice(l, 1);
                    }
                    if (check.specs.length > 0 && filteredChecks.indexOf(check) <= -1) {
                        filteredChecks = filteredChecks.concat(check);
                    }
                }
                this.routineChecks([]);
                this.routineChecks.push(filteredChecks);
                var tempArray = [];
                var routineItems = [];
                if (this.frequencyGroups().length > 0) {
                    for (var a = 0, rcheck = this.routineChecks[a]; a < this.routineChecks.length; a++ , rcheck = this.routineChecks[a]) {
                        for (var b = 0, freqgrp = this.frequencyGroups()[b]; b < this.frequencyGroups().length; b++ , freqgrp = this.frequencyGroups()[b]) {
                            for (var c = 0, item = freqgrp.items()[c]; c < freqgrp.items().length; c++ , item = freqgrp.items()[c]) {
                                if (rcheck.level8GroupProcessId == item.level8GroupProcessId &&
                                    rcheck.level8PreviousControlId == item.level8PreviousControlId &&
                                    rcheck.level8PreviousPositionId == item.level8PreviousPositionId &&
                                    rcheck.position == item.position) {
                                    for (var d = 0, ptNumber = item.partNumbers[d]; d < item.partNumbers.length; d++ , ptNumber = item.partNumbers[d]) {
                                        if (this.selectedPartNumber().id == ptNumber.PartNumberID) {
                                            if (routineItems.indexOf(item) <= -1) {
                                                routineItems = routineItems.concat(item);
                                                if (tempArray.indexOf(freqgrp) <= -1) {
                                                    tempArray = tempArray.concat(freqgrp);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                for (var y = 0; y < tempArray.length; y++) {
                    for (var z = tempArray[y].items().length; z > -1; z--) {
                        if (routineItems.indexOf(tempArray[y].items()[z]) <= -1) {
                            tempArray[y].items.splice(z, 1);
                        }
                    }
                }
                this.freqGroupCopy(this.frequencyGroups());
                this.frequencyGroups(tempArray);
                var itemId = 'itemClick-' + this.routineChecks[0].level8GroupProcessId + '-' + this.routineChecks[0].level8PreviousControlId + '-' + this.routineChecks[0].level8PreviousPositionId;
                this.routineItemId(itemId);
                this.nextCheck();
            }
            else if (this.selectedPartNumber().id == 0) {  //If part number is not selected, ask the user to select a part number
                let message = '<div style="text-align: center;">Part Number is not selected.</div><div style="text-align: center;">Please select Part number to execute this routine.</div>';
                this.alertModal(message, 'Routine: ' + this.selectedRoutine());
            }
}

 if (mainVM.selectedRoutine() != "Select a Routine") { // added to call the next check in line.
                                            if (mainVM.routineChecksIndex() < mainVM.routineChecks.length) {
                                                mainVM.routineChecksIndex(mainVM.routineChecksIndex() + 1);
                                                var itemId = 'itemClick-' + mainVM.routineChecks[mainVM.routineChecksIndex()].level8GroupProcessId + '-' + mainVM.routineChecks[mainVM.routineChecksIndex()].level8PreviousControlId + '-' + mainVM.routineChecks[mainVM.routineChecksIndex()].level8PreviousPositionId;
                                                mainVM.routineItemId(itemId);
                                                mainVM.nextCheck();
                                            }
                                            if (mainVM.routineChecksIndex() == mainVM.routineChecks.length - 1) {
                                                mainVM.selectedRoutine("Select a Routine");
                                            }
                                            mainVM.dispositionModalClose();
} else {
                                            savedItem.clear();
                                            savedItem.selectedProduct(null);
                                            $('#inputModal').modal('hide');
                                            mainVM.dispositionModalClose();
                                            this.saveButtonIcon('fa fa-save');
                                            // Refresh Page to get all frequency groups after executing a routine
                                            if (mainVM.routineChecksIndex() > 0) {
                                                window.location.reload();
                                            }
                                        }
}