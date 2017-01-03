---
title: Select/deselect all rows with with a "select all" header Checkbox
page_title:  Select/deselect all rows with with a "select all" header Checkbox | Kendo UI Grid
description: "Select/deselect all rows with with a "select all" header Checkbox in the Kendo UI Grid widget."
slug: howto_select_deselect_all_rowswith_checkboxes_grid
---

# Select/deselect all rows with with a "select all" header Checkbox

The example below demonstrates how to select/deselect all rows in the Kendo UI Grid widget via a "select all" checkbox in the header of the template checkbox column. Selecting multiple rows via the checkboxes can be also performed. Custom styling of the checkboxes is shown as well.

###### Example

```html
   <div id="grid"></div>
    <button id="showSelection">Show selected IDs</button>
    <script>
      $(document).ready(function () {
        //DataSource definition
        var crudServiceBaseUrl = "http://demos.kendoui.com/service",
            dataSource = new kendo.data.DataSource({
              transport: {
                read: {
                  url: crudServiceBaseUrl + "/Products",
                  dataType: "jsonp"
                },
                update: {
                  url: crudServiceBaseUrl + "/Products/Update",
                  dataType: "jsonp"
                },
                destroy: {
                  url: crudServiceBaseUrl + "/Products/Destroy",
                  dataType: "jsonp"
                },
                create: {
                  url: crudServiceBaseUrl + "/Products/Create",
                  dataType: "jsonp"
                },
                parameterMap: function (options, operation) {
                  if (operation !== "read" && options.models) {
                    return {
                      models: kendo.stringify(options.models)
                    };
                  }
                }
              },
              batch: true,
              pageSize: 20,
              schema: {
                model: {
                  id: "ProductID",
                  fields: {
                    ProductID: {
                      editable: false,
                      nullable: true
                    },
                    ProductName: {
                      validation: {
                        required: true
                      }
                    },
                    UnitPrice: {
                      type: "number",
                      validation: {
                        required: true,
                        min: 1
                      }
                    },
                    Discontinued: {
                      type: "boolean"
                    },
                    UnitsInStock: {
                      type: "number",
                      validation: {
                        min: 0,
                        required: true
                      }
                    }
                  }
                }
              }
            });

        //Grid definition
        var grid = $("#grid").kendoGrid({
          dataSource: dataSource,
          pageable: true,
          height: 430,
          //define dataBound event handler
          dataBound: onDataBound,
          toolbar: ["create"],
          columns: [
            //define template column with checkbox and attach click event handler
            { 
              title: 'Select All',
              headerTemplate: `<input type="checkbox" id="header-chb" class="k-checkbox">
<label class="k-checkbox-label" for="header-chb"></label>`,
              template: function(dataItem){
                return `<input type="checkbox" id="${dataItem.ProductID}" class="k-checkbox">
<label class="k-checkbox-label" for="${dataItem.ProductID}"></label>`
              },
              width: 80
            },
            "ProductName", {
              field: "UnitPrice",
              title: "Unit Price",
              format: "{0:c}",
              width: "100px"
            }, {
              field: "UnitsInStock",
              title: "Units In Stock",
              width: "100px"
            }, {
              field: "Discontinued",
              width: "100px"
            }, {
              command: ["edit", "destroy"],
              title: "&nbsp;",
              width: "172px"
            }
          ],
          editable: "inline"
        }).data("kendoGrid");

        //bind click event to the checkbox
        grid.table.on("click", ".k-checkbox" , selectRow);
        $('#header-chb').change(function(ev){
          var checked = ev.target.checked;
          $('.k-checkbox').each(function(idx, item){
            if(checked){
              if(!($(item).closest('tr').is('.k-state-selected'))){
                $(item).click();
              }
            } else {
              if($(item).closest('tr').is('.k-state-selected')){
                $(item).click();
              }
            }
          });

        });

        $("#showSelection").bind("click", function () {
          var checked = [];
          for(var i in checkedIds){
            if(checkedIds[i]){
              checked.push(i);
            }
          }

          alert(checked);
        });
      });

      var checkedIds = {};

      //on click of the checkbox:
      function selectRow() {
        var checked = this.checked,
            row = $(this).closest("tr"),
            grid = $("#grid").data("kendoGrid"),
            dataItem = grid.dataItem(row);

        checkedIds[dataItem.id] = checked;
        if (checked) {
          //-select the row
          row.addClass("k-state-selected");
        } else {
          //-remove selection
          row.removeClass("k-state-selected");
        }
      }

      //on dataBound event restore previous selected rows:
      function onDataBound(e) {
        var view = this.dataSource.view();
        for(var i = 0; i < view.length;i++){
          if(checkedIds[view[i].id]){
            this.tbody.find("tr[data-uid='" + view[i].uid + "']")
              .addClass("k-state-selected")
              .find(".checkbox")
              .attr("checked","checked");
          }
        }
      }
    </script>
```

## See Also

Other articles on the Kendo UI Grid and how-to examples on the selection functionality:

* [JavaScript API Reference](/api/javascript/ui/grid)
* [How to Make Selection with Checkbox Column]({% slug howto_make_selection_checkbox_column_grid %})
* [How to Persist Row Selection while Paging, Sorting, and Filtering]({% slug howto_persist_row_selection_paging_sorting_filtering_grid %})
* [How to Prevent Selection for Checkbox Cells]({% slug howto_prevent_selection_checkbox_cells_grid %})

For more runnable examples on the Kendo UI Grid, browse its [**How To** documentation folder]({% slug howto_create_custom_editors_grid %}).