package test;

import javax.script.*;

/**
 * Hello world!
 *
 */
public class App 
{
	private String whatToExecute;
	private ScriptEngineManager scriptEngineMgr;
	private ScriptEngine jsEngine;
	
	App()
	{
		whatToExecute = "Hello World!";
		scriptEngineMgr = new ScriptEngineManager();
		jsEngine = scriptEngineMgr.getEngineByName("JavaScript");
	}
	
	App(String line)
	{
		whatToExecute = line; 
		scriptEngineMgr = new ScriptEngineManager();
		jsEngine = scriptEngineMgr.getEngineByName("JavaScript");
	}
	
	public Object execute() throws ScriptException, NoSuchMethodException
	{
		if (jsEngine == null) 
		{
	        System.err.println("No script engine found for JavaScript");
	        System.exit(1);
	    }
		
		return jsEngine.eval(whatToExecute);
	}
	
	public String toString()
	{
		return whatToExecute;
	}
	
	public static void main(String[] args) throws NoSuchMethodException, ScriptException
	{
		App what = new App("1+2");
		Object a = what.execute();
		
		System.out.println(a);
	}
}
