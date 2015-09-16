!function(){var n=Handlebars.template,t=Handlebars.templates=Handlebars.templates||{};t["tmpl-history-result"]=n({compiler:[6,">= 2.0.0-beta.1"],main:function(n,t,e,a){var s,l=t.helperMissing,r="function",o=this.escapeExpression;return'<html>\n<head lang="en">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <meta charset="utf-8">\n    <title>Application</title>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <meta name="description" content="Bootstrap Template">\n    <meta name="Mark Stacy" content="OU IT Informatics">\n    <link rel="stylesheet" href="http://mgmic.oscer.ou.edu/portal/bower_components/boostrap_style/flatly/bootstrap.min.css">\n    <!--<link rel="stylesheet" href="http://mgmic.oscer.ou.edu/portal/style.css">-->\n</head>\n<body style="padding:5px;">\n  <div class="panel panel-default" >\n  <!-- Default panel contents -->\n    <div class="panel-heading"><b>Workflow Status</b> <span style="float:right;">Task ID: '+o((s=null!=(s=t.task_id||(null!=n?n.task_id:n))?s:l,typeof s===r?s.call(n,{name:"task_id",hash:{},data:a}):s))+'</span></div>\n      <table class="table table-striped table-condensed" style="border-radius:10px;">\n    <!--<thead>\n      <tr>\n        <th>Workflow</th>\n        <th>Status</th>\n      </tr>\n    </thead>-->\n      <tbody>\n        <tr id="qc"class="" style="margin:1px;">\n          <td class="col-sm-4" >Quality Control</td>\n          <td class="">WAITING </td>\n        </tr>\n        <tr id="s16"class="">\n          <td>16S Classification</td>\n          <td>WAITING </td>\n        </tr>\n        <tr id="aray" class="">\n          <td>Assemble Ray</td>\n          <td>WAITING </td>\n        </tr>\n        <tr id="fgs" class="">\n          <td>Functional Gene Search</td>\n          <td>WAITING </td>\n        </tr>\n        <tr id="report" class="">\n          <td>Report Generation</td>\n          <td>WAITING </td>\n        </tr>\n      </tbody>\n      </table>\n    </div>\n    <div id="task_result"></div>\n</body>\n<script src="http://mgmic.oscer.ou.edu/portal/bower_components/jquery/dist/jquery.min.js"></script>\n<script type="text/javascript" src="http://mgmic.oscer.ou.edu/portal/bower_components/bootstrap/dist/js/bootstrap.min.js"></script>\n<script type="text/javascript" src="http://mgmic.oscer.ou.edu/portal/bower_components/handlebars/handlebars.runtime.min.js"></script>\n<script src="http://mgmic.oscer.ou.edu/portal/jquery.form.js"></script>\n<!--<script src="api.js"></script>-->\n<script src="http://mgmic.oscer.ou.edu/portal/templates.js"></script>\n<script>\n$(function() {\n  total_fgs=0;curent_fgs=0;\n    poll_url = "http://mgmic.oscer.ou.edu/api/queue/task/'+o((s=null!=(s=t.task_id||(null!=n?n.task_id:n))?s:l,typeof s===r?s.call(n,{name:"task_id",hash:{},data:a}):s))+'/.json";\n    result_obj=null;\n    poll();\n});\nfunction set_workflow_status(id,data){\n    temp = Handlebars.templates[\'tmpl-status\']\n    $(\'#\' + id + " td:nth-child(2)").html(temp(data))\n}\nfunction poll() {\n       $.ajax({ url:poll_url , success: function(data) {\n            //console.log(data);\n            if (data.result.status=="PENDING"){\n                $(\'#task_result\').empty();\n                $(\'#task_result\').append("<pre>" + JSON.stringify(data.result,null, 4) + "</pre>")\n                setTimeout(function() { poll(); }, 3000);\n            }else{\n                if (data.result.status=="SUCCESS"){\n                  set_workflow_status(\'qc\',{status:data.result.status,progress_display:"none",success_display:"inline"})\n                  $(\'#qc\').addClass("success")\n                  subtask_poll(data)\n                }else{\n                  set_workflow_status(\'qc\',{status:data.result.status,progress_display:"none",success_display:"none"})\n                  $(\'#qc\').addClass("danger")\n                }\n                $(\'#task_result\').empty();\n                temp = data.result;\n                delete temp.children;\n                result_obj=temp;\n                $(\'#task_result\').append("<pre>" + JSON.stringify(temp,null, 4) + "</pre>");\n                $(\'#task_result\').urlize();\n                //$(\'#task_result\').append("<pre>" + JSON.stringify(data.result,null, 4) + "</pre>");\n                //$(\'#task_result\').urlize();\n            }\n       }});\n}\nfunction subtask_poll(data){\n  children = data.result.children\n  len = children.length;\n  idx=0\n  //total_fgs = len-3\n  try{\n    s16_id =children[1][0][0]\n    idx++;\n    poll_subtask(s16_id,\'s16\');\n  }catch(err) {\n    sts = "No subtask for 16S Classification"\n    set_workflow_status("s16",{status:sts,progress_display:"none",success_display:"none"})\n  }\n  try{\n    aray_id = children[0][0][0]\n    idx++;\n    poll_subtask(aray_id,\'aray\');\n  }catch(err) {\n    sts = "No subtask for Assemble Ray"\n    set_workflow_status("aray",{status:sts,progress_display:"none",success_display:"none"})\n  }\n  try{\n    report_id=children[len-1][0][0]\n    poll_subtask(report_id,\'report\');\n  }catch(err){\n    sts="No subtask for report generation"\n    set_workflow_status("report",{status:sts,progress_display:"none",success_display:"none"});\n  }\n  //s16_id =children[1][0][0]\n  //aray_id = children[0][0][0]\n  fgs_id=[]\n  for (i = idx; i < len -2 ; i++) {\n    total_fgs++;\n    fgs_id.push(children[i][0][0])\n  }\n  if (fgs_id.length==0){\n    set_workflow_status("fgs",{status:"None Submitted.",progress_display:"none",success_display:"none"});\n  }\n  $.each(fgs_id,function(idx,value){ poll_subtask(value,\'fgs\') });\n}\nfunction poll_subtask(task_id,html_id){\n   $.ajax({ url:"http://mgmic.oscer.ou.edu/api/queue/task/" + task_id + "/.json" , success: function(data) {\n        if (data.status=="PENDING"){\n          if(html_id=="fgs"){\n            sts = data.status + " " + curent_fgs + " out of " + total_fgs + " Completed"\n            set_workflow_status(html_id,{status:sts,progress_display:"inline",success_display:"none"})\n          }else{\n            set_workflow_status(html_id,{status:data.status,progress_display:"inline",success_display:"none"})\n          }\n          setTimeout(function() { poll_subtask(task_id,html_id); }, 3000);\n        }else if (data.status=="RETRY"){\n          //console.log(data.children[0][0][0]);\n          setTimeout(function() { poll_subtask(data.children[0][0][0],html_id); }, 3000);\n        }else{\n          if (data.status=="SUCCESS"){\n            if(html_id=="fgs"){\n              curent_fgs = curent_fgs +1;\n              sts = data.status + " " + curent_fgs + " out of " + total_fgs + " Completed"\n              if (curent_fgs == total_fgs){\n                  set_workflow_status(html_id,{status:sts,progress_display:"none",success_display:"inline"})\n                  $(\'#\' + html_id).addClass("success")\n              }else{\n                  sts = "PENDING " + curent_fgs + " out of " + total_fgs + " Completed"\n                  set_workflow_status(html_id,{status:sts,progress_display:"inline",success_display:"none"})\n              }\n            }else if(html_id=="report"){\n               data_url = result_obj.result;\n               data_report_url = data.result;\n               delete result_obj.result;\n               result_obj.data=data_url;\n               result_obj.report= data_report_url;\n               //result_obj.result ={"data":data_url,"report":data_report_url}\n               $(\'#task_result\').empty();\n               $(\'#task_result\').append("<pre>" + JSON.stringify(result_obj,null, 1) + "</pre>");\n               $(\'#task_result\').urlize();\n               set_workflow_status(html_id,{status:data.status,progress_display:"none",success_display:"inline"})\n               $(\'#\' + html_id).addClass("success")\n            }else{\n              set_workflow_status(html_id,{status:data.status,progress_display:"none",success_display:"inline"})\n              $(\'#\' + html_id).addClass("success")\n            }\n          }else{\n            if(html_id=="fgs"){\n              sts = data.status + " " + curent_fgs + " out of " + total_fgs + " Completed"\n              set_workflow_status(html_id,{status:sts,progress_display:"none",success_display:"none"})\n              $(\'#\' + html_id).addClass("danger")\n            }else{\n              set_workflow_status(html_id,{status:data.status,progress_display:"none",success_display:"none"})\n              $(\'#\' + html_id).addClass("danger")\n            }\n          }\n        }}});\n\n}\njQuery.fn.urlize = function() {\n    if (this.length > 0) {\n        this.each(function(i, obj){\n            // making links active\n            var x = $(obj).html();\n            var list = x.match( /\\b(http:\\/\\/|www\\.|http:\\/\\/www\\.)[^ <]{2,200}\\b/g );\n            if (list) {\n                for ( i = 0; i < list.length; i++ ) {\n                    var prot = list[i].indexOf(\'http://\') === 0 || list[i].indexOf(\'https://\') === 0 ? \'\' : \'http://\';\n                    x = x.replace( list[i], "<a target=\'_blank\' href=\'" + prot + list[i] + "\'>"+ list[i] + "</a>" );\n                }\n\n            }\n            $(obj).html(x);\n        });\n    }\n};\n\n</script>\n</hmtl>\n'},useData:!0}),t["tmpl-iframe"]=n({compiler:[6,">= 2.0.0-beta.1"],main:function(){return'<iframe width="100%" frameborder="0" id="myIframe" src="" style="min-height:420px;"></iframe>\n'},useData:!0}),t["tmpl-result"]=n({compiler:[6,">= 2.0.0-beta.1"],main:function(){return'<div class="panel panel-default" >\n  <!-- Default panel contents -->\n<div class="panel-heading"><b>Workflow Status</b></div>\n  <table class="table table-striped table-condensed" style="border-radius:10px;">\n    <!--<thead>\n      <tr>\n        <th>Workflow</th>\n        <th>Status</th>\n      </tr>\n    </thead>-->\n    <tbody>\n      <tr id="qc"class="" style="margin:1px;">\n        <td class="col-sm-4" >Quality Control</td>\n        <td class="">WAITING </td>\n      </tr>\n      <tr id="s16"class="">\n        <td>16S Classification</td>\n        <td>WAITING </td>\n      </tr>\n      <tr id="aray" class="">\n        <td>Assemble Ray</td>\n        <td>WAITING </td>\n      </tr>\n      <tr id="fgs" class="">\n        <td>Functional Gene Search</td>\n        <td>WAITING </td>\n      </tr>\n      <tr id="report" class="">\n        <td>Report Generation</td>\n        <td>WAITING </td>\n      </tr>\n    </tbody>\n</table>\n</div>\n<div id="task_result"></div>\n'},useData:!0}),t["tmpl-status"]=n({compiler:[6,">= 2.0.0-beta.1"],main:function(n,t,e,a){var s,l=t.helperMissing,r="function",o=this.escapeExpression;return'<img src="http://mgmic.oscer.ou.edu/portal/check.png" height="20" width="20" style="display:'+o((s=null!=(s=t.success_display||(null!=n?n.success_display:n))?s:l,typeof s===r?s.call(n,{name:"success_display",hash:{},data:a}):s))+';margin-left:1px;margin-right:2px;"><img src="http://mgmic.oscer.ou.edu/portal/spinner.gif" height="20" width="20" style="display:'+o((s=null!=(s=t.progress_display||(null!=n?n.progress_display:n))?s:l,typeof s===r?s.call(n,{name:"progress_display",hash:{},data:a}):s))+';margin-left:1px;"><span style="margin-left:5px;">'+o((s=null!=(s=t.status||(null!=n?n.status:n))?s:l,typeof s===r?s.call(n,{name:"status",hash:{},data:a}):s))+"</span>\n"},useData:!0}),t["tmpl-task"]=n({compiler:[6,">= 2.0.0-beta.1"],main:function(n,t,e,a){var s,l=t.helperMissing,r="function",o=this.escapeExpression;return'<div id="task_submit">\n  <div class="row">\n    <div class="col-sm-9 form-group">\n            <label for="sample-type">Sample Type</label>\n            <label class="radio-inline active">\n              <input type="radio" name="sample-type" value="metagenome" checked="">Metagenome\n            </label>\n            <label class="radio-inline">\n              <input type="radio" name="sample-type" value="amplicon">Amplicon\n            </label>\n        </div>\n    </div>\n <div id="hide_metagenomic">\n  <form class="col-sm-12 form1" id="task_form" onsubmit="return task_submit();">\n      <div style="display:none">\n          <input type="hidden" name="csrfmiddlewaretoken" value="'+o((s=null!=(s=t.csrftoken||(null!=n?n.csrftoken:n))?s:l,typeof s===r?s.call(n,{name:"csrftoken",hash:{},data:a}):s))+'"/>\n          <input type="hidden" name="sample-type" value="metagenome"/>\n     </div>\n    <div class="row">\n        <div class="col-sm-4 form-group required">\n          <label class="control-label" for="sample_name">Sample Name</label>\n          <input id="sample_name" type="text" class="form-control input-sm" name="sample_name" placeholder="Name" >\n        </div>\n        <div class="col-sm-2 form-group">\n          <label for="latitude">Latitude</label>\n          <input type="text" class="form-control input-sm" name="latitude" placeholder="Latitude" >\n        </div>\n        <div class="col-sm-2 form-group">\n          <label for="longitude">Longitude</label>\n          <input type="text" class="form-control input-sm" name="longitude" placeholder="Longitude" >\n        </div>\n    </div>\n    <div class="row">\n        <div class="col-sm-9 form-group">\n            <label  for="corrosion">In Situ Corrosion Level </label>&nbsp;&nbsp;\n            <label class="radio-inline">\n              <input type="radio" name="corrosion" value="High">High\n            </label>\n            <label class="radio-inline">\n              <input type="radio" name="corrosion" value="Moderate">Moderate\n            </label>\n            <label class="radio-inline">\n              <input type="radio" name="corrosion" value="Low">Low\n            </label>\n            <label class="radio-inline active">\n              <input type="radio" name="corrosion" value="Unkown" checked="">Unknown\n            </label>\n        </div>\n    </div>\n    <div class="row">\n        <div class="col-sm-9 form-group">\n            <label for="corrosion_rx">Corrosion Treatment </label>&nbsp;&nbsp;\n            <label class="radio-inline">\n              <input type="radio" name="corrosion_rx" value="Yes">Yes\n            </label>\n            <label class="radio-inline">\n              <input type="radio" name="corrosion_rx" value="No">No\n            </label>\n            <label class="radio-inline active">\n              <input type="radio" name="corrosion_rx" value="Unkown" checked="">Unknown\n            </label>\n        </div>\n    </div>\n    <div class="row">\n        <div class="col-sm-2 form-group">\n          <label for="nitrate">Nitrate</label>\n          <input type="number" size="10" class="form-control input-sm" min="0" step="1" name="nitrate" placeholder="Nitrate (nM)" >\n        </div>\n        <div class="col-sm-2 form-group">\n          <label for="sulfate">Sulfate</label>\n          <input type="number" class="form-control input-sm" min="0" step="1" name="sulphate" placeholder="Sulfate (nM)" >\n        </div>\n        <div class="col-sm-2 form-group">\n          <label for="phosphate">Phosphate</label>\n          <input type="number" class="form-control input-sm" min="0" step="1" name="phosphate" placeholder="Phosphate (nM)" >\n        </div>\n        <div class="col-sm-2 form-group">\n          <label for="temp">Temperature</label>\n          <input type="number" class="form-control input-sm" min="0" step="1" name="temp" placeholder="Temperature (C)" >\n        </div>\n    </div>\n    <div class="row">\n        <div class="col-sm-12 form-group">\n            <label for="biomass">In Situ Biomass </label>&nbsp;&nbsp;\n            <label class="radio-inline">\n              <input type="radio" name="biomass" value="High">High\n            </label>\n            <label class="radio-inline">\n              <input type="radio" name="biomass" value="Moderate">Moderate\n            </label>\n            <label class="radio-inline">\n              <input type="radio" name="biomass" value="Low">Low\n            </label>\n            <label class="radio-inline active">\n              <input type="radio" name="biomass" value="Unkown" checked="">Unknown\n            </label>\n        </div>\n    </div>\n    <div class="row">\n        <div class="col-sm-2 form-group">\n          <label for="oil_water">Oil:Water</label>\n          <input type="number"  class="form-control input-sm" min="0" step="1" name="oil_water" placeholder="Oil:Water (Ratio)" >\n        </div>\n        <div class="col-sm-2 form-group">\n          <label for="acetate">Acetate</label>\n          <input type="number"  class="form-control input-sm" min="0" step="1" name="acetate" placeholder="Acetate (nM)" >\n        </div>\n        <div class="col-sm-2 form-group">\n          <label for="propionate">Propionate</label>\n          <input type="number" size="10" class="form-control input-sm" min="0" step="1" name="propionate" placeholder="Propionate (nM)" >\n        </div>\n    </div>\n    <div class="row">\n      <div class="col-sm-4 form-group" style="padding-top:5px;">\n        <label for="fgs">Functional Gene Search</label>\n\n        <input id="visual_fgs" type="text" class="form-control input-sm col-sm-2"  value="" style="float:right " readonly/>\n      </div>\n      <div class="col-sm-3 form-group float-btn">\n        <button id="fgs_btn" type="button" class="btn btn-default">Gene Database</button>\n      </div>\n    </div>\n    <div role="tabpanel" class="tabbable" style="clear:both;" >\n     <ul id=\'myTa\' class="nav nav-tabs  " role="tablist">\n        <li role="presentation" class="active"><a href="#url" aria-controls="url" role="tab" data-toggle="tab">Data Url</a></li>\n        <li role="presentation"><a href="#upload" aria-controls="upload" role="tab" data-toggle="tab">Upload Data</a></li>\n      </ul>\n      <div id="myTabContent1" class="tab-content" style="margin-bottom:0px">\n        <div role="tabpanel" class="tab-pane fade in active" id="url">\n            <div class="row">\n                <div class="form-group required col-sm-9">\n                    <label class="control-label" for="args">Forward Read URL</label>\n                    <input id="foward_url" type="text" class="form-control input-sm" name="args" placeholder="Forward Read URL" >\n                </div>\n            </div>\n            <div class="row">\n               <div class="form-group required col-sm-9">\n                    <label class="control-label" for="args">Reverse Read URL</label>\n                    <input id="reverse_url" type="text" class="form-control input-sm" name="args" placeholder="Reverse Read URL" >\n                </div>\n            </div>\n            <button type="submit" id="form_submit" class="btn btn-default pull-right">Submit Sample</button>\n           </form>\n        </div>\n        <div role="tabpanel" class="tab-pane fade" id="upload">\n            <form class="col-sm-12 form1" id="task_form_file" onsubmit="return task_submit_file();">\n                <div style="display:none">\n                    <input type="hidden" name="csrfmiddlewaretoken" value="'+o((s=null!=(s=t.csrftoken||(null!=n?n.csrftoken:n))?s:l,typeof s===r?s.call(n,{name:"csrftoken",hash:{},data:a}):s))+'"/>\n                </div>\n                <div class="row">\n                    <div class="form-group required col-sm-9">\n                        <label class="control-label" for="args">Forward Read File</label>\n                        <input type="file" class="form-control file-form-control input-sm" name="forward_file" placeholder="Forward Read File" >\n                    </div>\n                </div>\n                <div class="row">\n                   <div class="form-group required col-sm-9">\n                        <label class="control-label" for="args">Reverse Read File</label>\n                        <input type="file" class="form-control file-form-control input-sm" name="reverse_file" placeholder="Reverse Read File" >\n                    </div>\n                </div>\n                <button type="submit" id="form_submit" class="btn btn-default pull-right">Submit Sample</button>\n             </form>\n          </div>\n     </div>\n  </div>\n </div> <!--End of metgenomic-->\n <div id="hide_amplicon">\n    <div role="tabpanel" class="tabbable" style="clear:both;" >\n     <ul id=\'myTa\' class="nav nav-tabs  " role="tablist">\n        <li role="presentation" class="active"><a href="#url" aria-controls="url" role="tab" data-toggle="tab">Data Url</a></li>\n        <li role="presentation"><a href="#upload" aria-controls="upload" role="tab" data-toggle="tab">Upload Data</a></li>\n      </ul>\n      <div id="myTabContent1" class="tab-content" style="margin-bottom:0px">\n        <div role="tabpanel" class="tab-pane fade in active" id="url">\n            <div class="row">\n                <div class="form-group required col-sm-9">\n                    <label class="control-label" for="args">Forward Read URL</label>\n                    <input id="foward_url" type="text" class="form-control input-sm" name="args" placeholder="Forward Read URL" >\n                </div>\n            </div>\n            <div class="row">\n               <div class="form-group required col-sm-9">\n                    <label class="control-label" for="args">Reverse Read URL</label>\n                    <input id="reverse_url" type="text" class="form-control input-sm" name="args" placeholder="Reverse Read URL" >\n                </div>\n            </div>\n            <button type="submit" id="form_submit" class="btn btn-default pull-right">Submit Sample</button>\n           </form>\n        </div>\n        <div role="tabpanel" class="tab-pane fade" id="upload">\n            <form class="col-sm-12 form1" id="task_form_file" onsubmit="return task_submit_file();">\n                <div style="display:none">\n                    <input type="hidden" name="csrfmiddlewaretoken" value="'+o((s=null!=(s=t.csrftoken||(null!=n?n.csrftoken:n))?s:l,typeof s===r?s.call(n,{name:"csrftoken",hash:{},data:a}):s))+'"/>\n                </div>\n                <div class="row">\n                    <div class="form-group required col-sm-9">\n                        <label class="control-label" for="args">Forward Read File</label>\n                        <input type="file" class="form-control file-form-control input-sm" name="forward_file" placeholder="Forward Read File" >\n                    </div>\n                </div>\n                <div class="row">\n                   <div class="form-group required col-sm-9">\n                        <label class="control-label" for="args">Reverse Read File</label>\n                        <input type="file" class="form-control file-form-control input-sm" name="reverse_file" placeholder="Reverse Read File" >\n                    </div>\n                </div>\n                <button type="submit" id="form_submit" class="btn btn-default pull-right">Submit Sample</button>\n            </form>\n        </div>\n      </div>\n    </div>    \n\n\n    <form class="col-sm-12 form1" id="amplicon_form" onsubmit="return false;">\n     <div class="row">\n        <div class="col-sm-4 form-group required">\n          <label class="control-label" for="sample_name">Sample Name</label>\n          <input id="sample_name" type="text" class="form-control input-sm" name="sample_name" placeholder="Name" >\n        </div>\n     </div> \n     <div class="row">\n        <div class="col-sm-8 form-group required">\n          <label class="control-label" for="map_file">Map File</label>\n          <textarea rows="15" name="map_file" form="amplicon_form" style="width:100%;white-space:pre;overflow:auto;"></textarea>\n          <button type="submit" class="btn btn-default pull-right">Check Map File</button>\n        </div>\n     </div>\n    </form>   \n </div> <!--End of amplicon-->\n</div>\n<div id="output">\n  <h3>Sample Submitted</h3>\n  <button id="newSample" type="button" class="btn btn-default" style="float:right;margin-right:20px;" disabled>Submit Another Sample</button>\n  <div id="file-up" class="col-md-9">\n    <h4>File Upload</h4>\n    <div class="progress">\n      <div class="bar">\n    </div>\n    <div class="percent">0%</div>\n  </div>\n</div>\n\n<div id="results" class="col-md-9" style="clear:both;">\n    <div id="task_result"></div>\n</div>\n</div>\n'},useData:!0}),t["tmpl-tr"]=n({compiler:[6,">= 2.0.0-beta.1"],main:function(n,t,e,a){var s,l=t.helperMissing,r="function",o=this.escapeExpression;return'<tr><td><a href="#" onclick="showResult(\''+o((s=null!=(s=t.task_id||(null!=n?n.task_id:n))?s:l,typeof s===r?s.call(n,{name:"task_id",hash:{},data:a}):s))+"');return false;\" >"+o((s=null!=(s=t.task_name||(null!=n?n.task_name:n))?s:l,typeof s===r?s.call(n,{name:"task_name",hash:{},data:a}):s))+"</a></td><td>"+o((t.time_zone||n&&n.time_zone||l).call(n,null!=n?n.timestamp:n,{name:"time_zone",hash:{},data:a}))+"</td><td><pre>"+o((t.json_metatags||n&&n.json_metatags||l).call(n,null!=n?n.tags:n,{name:"json_metatags",hash:{},data:a}))+"</pre></td></tr>\n"},useData:!0}),t["tmpl-user"]=n({compiler:[6,">= 2.0.0-beta.1"],main:function(n,t,e,a){var s,l=t.helperMissing,r="function",o=this.escapeExpression;return'      <h2>User Profile</h2>\n      <div id="user_profile">\n          <div id="photo" class="col-md-2" style="width:200px ">\n            <img src="'+o((s=null!=(s=t.gravator_url||(null!=n?n.gravator_url:n))?s:l,typeof s===r?s.call(n,{name:"gravator_url",hash:{},data:a}):s))+'?s=180&d=mm"><br><br>\n            <a href="https://en.gravatar.com/" target="_blank" style="clear:both;">Profile Image</a><br><br>\n            <a id="reset_password" style="clear:both;">Reset Password</a>\n          </div>\n          <form  id="view_form" class="form-horizontal col-md-4" onsubmit="return edit_user();">\n              <div class="form-group">\n                <label class="col-md-4 control-label">Username</label>\n                  <div class="col-md-08">\n                <p class="form-control-static">'+o((s=null!=(s=t.username||(null!=n?n.username:n))?s:l,typeof s===r?s.call(n,{name:"username",hash:{},data:a}):s))+'</p>\n                </div>\n            </div>\n             <div class="form-group">\n                  <label class="col-md-4 control-label">Name</label>\n                    <div class="col-md-08">\n                  <p class="form-control-static">'+o((s=null!=(s=t.name||(null!=n?n.name:n))?s:l,typeof s===r?s.call(n,{name:"name",hash:{},data:a}):s))+'</p>\n                  </div>\n            </div>\n              <div class="form-group">\n                <label class="col-md-4 control-label">Email</label>\n                  <div class="col-md-08">\n                    <p class="form-control-static">'+o((s=null!=(s=t.email||(null!=n?n.email:n))?s:l,typeof s===r?s.call(n,{name:"email",hash:{},data:a}):s))+'</p>\n                 </div>\n             </div>\n             <button type="submit" id="form_submit" class="btn btn-default pull-right" style="margin-right:40px;">Edit</button>\n         </form>\n          <form class="col-md-4" id="user_form" onsubmit="return submit_user();">\n              <div style="display:none">\n                  <input type="hidden" name="csrfmiddlewaretoken" value="'+o((s=null!=(s=t.csrftoken||(null!=n?n.csrftoken:n))?s:l,typeof s===r?s.call(n,{name:"csrftoken",hash:{},data:a}):s))+'"/>\n             </div>\n              <div class="form-group">\n                 <label for="first_name">First Name</label>\n                  <input type="text" class="form-control" name="first_name" placeholder="John" value="'+o((s=null!=(s=t.first_name||(null!=n?n.first_name:n))?s:l,typeof s===r?s.call(n,{name:"first_name",hash:{},data:a}):s))+'">\n             </div>\n              <div class="form-group">\n                   <label for="last_name">Last Name</label>\n                    <input type="text" class="form-control" name="last_name" placeholder="Doe" value="'+o((s=null!=(s=t.last_name||(null!=n?n.last_name:n))?s:l,typeof s===r?s.call(n,{name:"last_name",hash:{},data:a}):s))+'">\n               </div>\n              <div class="form-group">\n                 <label for="email">Email address</label>\n                  <input type="email" class="form-control" name="email" placeholder="Enter email" value="'+o((s=null!=(s=t.email||(null!=n?n.email:n))?s:l,typeof s===r?s.call(n,{name:"email",hash:{},data:a}):s))+'">\n             </div>\n             <button type="submit" id="form_submit" class="btn btn-default pull-right">Update</button>\n         </form>\n         <div class="row" style="width:100%;clear:both;"></div>\n          <form class="form-inline" id="pass_form" onsubmit="return set_password();" style="display:none">\n            <div style="display:none">\n                    <input type="hidden" name="csrfmiddlewaretoken" value="'+o((s=null!=(s=t.csrftoken||(null!=n?n.csrftoken:n))?s:l,typeof s===r?s.call(n,{name:"csrftoken",hash:{},data:a}):s))+'"/>\n           </div>\n            <div class="form-group">\n             <label for="password">New Password</label>\n              <input type="password" class="form-control" name="password" placeholder="New Password">\n           </div>\n            <div class="form-group">\n             <label for="password2">Retype New Password</label>\n              <input type="password" class="form-control" name="password2" placeholder="Retype New Password">\n           </div>\n           <button type="submit" class="btn btn-default">Set Password</button>\n         </form>\n     </div>\n'},useData:!0})}();
