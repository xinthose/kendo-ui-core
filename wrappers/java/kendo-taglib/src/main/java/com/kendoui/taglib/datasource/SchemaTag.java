
package com.kendoui.taglib.datasource;

import com.kendoui.taglib.BaseTag;
import com.kendoui.taglib.json.Function;

import javax.servlet.jsp.JspException;

@SuppressWarnings("serial")
public class SchemaTag extends BaseTag /* interfaces *//* interfaces */ {
    
    @Override
    public int doEndTag() throws JspException {
//>> doEndTag

        Schema parent = (Schema)findParentWithClass(Schema.class);

        parent.setSchema(this);

//<< doEndTag

        return super.doEndTag();
    }
    
    public void setModel(ModelTag modelTag) {
        setProperty("model", modelTag.properties());
    }
    
    @Override
    public void initialize() {
//>> initialize
//<< initialize

        super.initialize();
    }

    @Override
    public void destroy() {
//>> destroy
//<< destroy

        super.destroy();
    }

//>> Attributes

    public static String tagName() {
        return "dataSource-schema";
    }

    public String getAggregates() {
        return (String)getProperty("aggregates");
    }

    public void setAggregates(String value) {
        setProperty("aggregates", value);
    }

    public String getData() {
        return (String)getProperty("data");
    }

    public void setData(String value) {
        setProperty("data", value);
    }

    public String getErrors() {
        return (String)getProperty("errors");
    }

    public void setErrors(String value) {
        setProperty("errors", value);
    }

    public String getGroups() {
        return (String)getProperty("groups");
    }

    public void setGroups(String value) {
        setProperty("groups", value);
    }

    public Object getModel() {
        return (Object)getProperty("model");
    }

    public void setModel(Object value) {
        setProperty("model", value);
    }

    public String getTotal() {
        return (String)getProperty("total");
    }

    public void setTotal(String value) {
        setProperty("total", value);
    }

    public String getType() {
        return (String)getProperty("type");
    }

    public void setType(String value) {
        setProperty("type", value);
    }

    public String getParse() {
        return ((Function)getProperty("parse")).getBody();
    }

    public void setParse(String value) {
        setProperty("parse", new Function(value));
    }

//<< Attributes

}
